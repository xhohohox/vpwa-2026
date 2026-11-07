import { ChannelSchema } from '#database/schema'
import { belongsTo, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import User from '#models/user'
import Message from '#models/message'
import KickVote from '#models/kick_vote'
import ChannelBan from '#models/channel_ban'
import RuleException from '#exceptions/rule_exception'

export default class Channel extends ChannelSchema {
  // the admin of the channel is the user who created it
  @belongsTo(() => User, { foreignKey: 'ownerId' })
  declare owner: BelongsTo<typeof User>

  // members and invited users, the pivot column status tells which is which
  @manyToMany(() => User, {
    pivotTable: 'channel_members',
    pivotColumns: ['status', 'invited_by_id', 'joined_at'],
    pivotTimestamps: { createdAt: 'created_at', updatedAt: false },
  })
  declare users: ManyToMany<typeof User>

  @hasMany(() => Message)
  declare messages: HasMany<typeof Message>

  @hasMany(() => KickVote)
  declare kickVotes: HasMany<typeof KickVote>

  @hasMany(() => ChannelBan)
  declare bans: HasMany<typeof ChannelBan>

  // the channel from the URL, with a message the frontend can show
  static async findByNameOrFail(name: string) {
    const channel = await Channel.findBy('name', name)
    if (!channel) throw new RuleException(`Channel #${name} does not exist`, { status: 404 })
    return channel
  }

  // a channel without a new message for 30 days ceases to exist, its name is free again (use case 2)
  static async deleteInactive() {
    const limit = DateTime.now().minus({ days: 30 }).toJSDate()
    await Channel.query().where('last_activity_at', '<', limit).delete()
  }

  // the users row in channel_members (status member or invited), null when not in the channel.
  membershipOf(this: Channel, user: User) {
    return this.related('users').pivotQuery().where('user_id', user.id).first()
  }

  async mustBeMember(this: Channel, user: User) {
    const membership = await this.membershipOf(user)
    if (membership?.status !== 'member') {
      throw new RuleException(`You are not a member of #${this.name}`, { status: 403 })
    }
  }

  banOf(user: User) {
    return ChannelBan.query().where('channel_id', this.id).where('user_id', user.id).first()
  }

  // a permanent ban: out of the channel, the votes against the user are not needed anymore
  async ban(this: Channel, user: User, by: User | null) {
    await ChannelBan.create({ channelId: this.id, userId: user.id, bannedById: by?.id ?? null })
    await this.related('users').detach([user.id])
    await KickVote.query().where('channel_id', this.id).where('target_user_id', user.id).delete()
  }
}


