import { ChannelBanSchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Channel from '#models/channel'

// A permanent ban from a channel, the admin lifts it with /invite
export default class ChannelBan extends ChannelBanSchema {
  @belongsTo(() => Channel)
  declare channel: BelongsTo<typeof Channel>

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  // the admin who banned, empty when banned by 3 votes
  @belongsTo(() => User, { foreignKey: 'bannedById' })
  declare bannedBy: BelongsTo<typeof User>
}