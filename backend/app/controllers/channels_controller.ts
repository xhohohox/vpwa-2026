import Channel from '#models/channel'
import ChannelTransformer from '#transformers/channel_transformer'
import RuleException from '#exceptions/rule_exception'
import { joinValidator } from '#validators/channel'
import type { HttpContext } from '@adonisjs/core/http'

export default class ChannelsController {
  async index({ auth, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    await Channel.deleteInactive()

    const channels = await Channel.query()
      .whereHas('users', (query) => query.where('users.id', user.id))
      .preload('owner')
      // in the order they came to the channel
      .preload('users', (query) => query.orderBy('channel_members.id'))
      .preload('bans', (query) => query.preload('user'))
      .preload('kickVotes', (query) => query.preload('target').preload('voter'))
      .orderBy('last_activity_at', 'desc')

    return serialize(ChannelTransformer.transform(channels))
  }

  // /join channelName [private]: joins the channel, or creates it when it does not exist (use case 4)
  async join({ auth, request }: HttpContext) {
    const user = auth.getUserOrFail()
    const { name, private: isPrivate } = await request.validateUsing(joinValidator)
    const member = { status: 'member', joined_at: new Date() }

    await Channel.deleteInactive()
    const channel = await Channel.findBy('name', name)

    if (!channel) {
      const created = await Channel.create({
        name,
        type: isPrivate ? 'private' : 'public',
        ownerId: user.id,
      })
      await created.related('users').attach({ [user.id]: member })
      return { name, result: 'created' }
    }

    if (isPrivate) throw new RuleException(`Channel #${name} already exists`, { status: 409 })
    if (await channel.banOf(user)) {
      throw new RuleException(`You are banned from #${name}`, { status: 403 })
    }

    const membership = await channel.membershipOf(user)
    if (membership?.status === 'member') return { name, result: 'member' }
    if (channel.type === 'private' && !membership) {
      throw new RuleException(`#${name} is private, you need an invitation`, { status: 403 })
    }

    // an invitation becomes a membership, a public channel is open to anyone
    await channel.related('users').detach([user.id])
    await channel.related('users').attach({ [user.id]: member })
    return { name, result: 'joined' }
  }

  // my invitation becomes a membership (use case 2)
  async accept({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const channel = await Channel.findByNameOrFail(params.name)

    const membership = await channel.membershipOf(user)
    if (membership?.status !== 'invited') {
      throw new RuleException(`No invitation to #${channel.name}`, { status: 404 })
    }
    await channel
      .related('users')
      .pivotQuery()
      .where('user_id', user.id)
      .update({ status: 'member', joined_at: new Date() })

    return response.noContent()
  }

  // /cancel: leaving or declining the invitation, the admin leaving deletes the channel (use case 5)
  async leave({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const channel = await Channel.findByNameOrFail(params.name)

    if (channel.ownerId === user.id) await channel.delete()
    else await channel.related('users').detach([user.id])

    return response.noContent()
  }

  // /quit: only the admin can delete the channel, its messages go with it (use case 4)
  async destroy({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const channel = await Channel.findByNameOrFail(params.name)

    if (channel.ownerId !== user.id) {
      throw new RuleException('Only the admin can close the channel', { status: 403 })
    }
    await channel.delete()

    return response.noContent()
  }
}
