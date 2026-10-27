import { KickVoteSchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Channel from '#models/channel'

// One vote of a member to kick a user from a public channel (3 votes = ban)
export default class KickVote extends KickVoteSchema {
  @belongsTo(() => Channel)
  declare channel: BelongsTo<typeof Channel>

  // who is being kicked
  @belongsTo(() => User, { foreignKey: 'targetUserId' })
  declare target: BelongsTo<typeof User>

  // the member who voted
  @belongsTo(() => User, { foreignKey: 'voterId' })
  declare voter: BelongsTo<typeof User>
}