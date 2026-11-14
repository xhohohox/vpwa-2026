import Channel from '#models/channel'
import User from '#models/user'
import KickVote from '#models/kick_vote'
import RuleException from '#exceptions/rule_exception'
import { nickNameValidator } from '#validators/channel'
import type { HttpContext } from '@adonisjs/core/http'

// The assignment: when at least 3 members kick a user from a public channel,
// the user gets a permanent ban (use case 4)
const KICK_VOTES_REQUIRED = 3

// the channel from the URL and the user from the command
async function channelAndTarget({ params, request }: HttpContext) {
  const { nickName } = await request.validateUsing(nickNameValidator)
  const channel = await Channel.findByNameOrFail(params.name)
  const target = await User.findByNickOrFail(nickName)
  return { channel, target }
}

export default class ChannelMembersController {
  // /invite nickName: any member of a public channel, only the admin of a private one.
  // The admin inviting a banned user lifts the ban (use case 4)
  async invite(ctx: HttpContext) {
    const me = ctx.auth.getUserOrFail()
    const { channel, target } = await channelAndTarget(ctx)
    const isAdmin = channel.ownerId === me.id

    await channel.mustBeMember(me)
    if (channel.type === 'private' && !isAdmin) {
      throw new RuleException('Only the admin of a private channel can invite', { status: 403 })
    }

    const membership = await channel.membershipOf(target)
    if (membership?.status === 'member') {
      throw new RuleException(`${target.nickName} is already a member of #${channel.name}`, {
        status: 409,
      })
    }

    const ban = await channel.banOf(target)
    if (ban && !isAdmin) {
      throw new RuleException(`${target.nickName} is banned from #${channel.name}`, { status: 403 })
    }
    await ban?.delete()

    if (!membership) {
      await channel
        .related('users')
        .attach({ [target.id]: { status: 'invited', invited_by_id: me.id } })
    }
    return { unbanned: Boolean(ban) }
  }

  // the member who invited, or the admin, takes the invitation back
  async uninvite(ctx: HttpContext) {
    const me = ctx.auth.getUserOrFail()
    const { channel, target } = await channelAndTarget(ctx)

    const membership = await channel.membershipOf(target)
    if (membership?.status !== 'invited') {
      throw new RuleException(`${target.nickName} has no pending invitation`, { status: 404 })
    }
    if (membership.invited_by_id !== me.id && channel.ownerId !== me.id) {
      throw new RuleException('Only the admin or the member who invited can uninvite', {
        status: 403,
      })
    }
    await channel.related('users').detach([target.id])

    return { uninvited: true }
  }

  // /revoke nickName: only the admin takes away an invitation or a membership (use case 4)
  async revoke(ctx: HttpContext) {
    const me = ctx.auth.getUserOrFail()
    const { channel, target } = await channelAndTarget(ctx)

    if (channel.ownerId !== me.id) {
      throw new RuleException('Only the admin can revoke access to the channel', { status: 403 })
    }
    if (target.id === channel.ownerId) {
      throw new RuleException('The admin of the channel cannot be removed', { status: 409 })
    }
    if (!(await channel.membershipOf(target))) {
      throw new RuleException(`${target.nickName} is not in #${channel.name}`, { status: 404 })
    }
    await channel.related('users').detach([target.id])

    return { revoked: true }
  }

  // /kick nickName: the admin bans at once, members of a public channel vote,
  // pressing kick again takes the vote back (use case 4)
  async kick(ctx: HttpContext) {
    const me = ctx.auth.getUserOrFail()
    const { channel, target } = await channelAndTarget(ctx)

    if (target.id === me.id) throw new RuleException('You cannot kick yourself', { status: 409 })
    if (target.id === channel.ownerId) {
      throw new RuleException('The admin of the channel cannot be kicked', { status: 403 })
    }
    await channel.mustBeMember(me)
    if (await channel.banOf(target)) {
      throw new RuleException(`${target.nickName} is already banned from #${channel.name}`, {
        status: 409,
      })
    }

    if (channel.ownerId === me.id) {
      await channel.ban(target, me)
      return { banned: true }
    }
    if (channel.type === 'private') {
      throw new RuleException('Only the admin can kick from a private channel', { status: 403 })
    }

    const votes = KickVote.query()
      .where('channel_id', channel.id)
      .where('target_user_id', target.id)

    const myVote = await votes.clone().where('voter_id', me.id).first()
    if (myVote) {
      await myVote.delete()
      return { banned: false, undone: true }
    }

    await KickVote.create({ channelId: channel.id, targetUserId: target.id, voterId: me.id })
    const allVotes = await votes.clone()
    if (allVotes.length >= KICK_VOTES_REQUIRED) {
      await channel.ban(target, null)
      return { banned: true }
    }
    return { banned: false, votes: allVotes.length, required: KICK_VOTES_REQUIRED }
  }
}
