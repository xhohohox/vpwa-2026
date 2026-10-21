import { ChannelSchema } from '#database/schema'
import { belongsTo, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Message from '#models/message'
import KickVote from '#models/kick_vote'
import ChannelBan from '#models/channel_ban'

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
}