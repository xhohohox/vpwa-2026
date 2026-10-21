import { UserSchema } from '#database/schema'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { type AccessToken, DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import Channel from '#models/channel'
import Message from '#models/message'

export default class User extends compose(UserSchema, withAuthFinder(hash)) {
  static accessTokens = DbAccessTokensProvider.forModel(User)
  declare currentAccessToken?: AccessToken

  // channels I created, so I am their admin
  @hasMany(() => Channel, { foreignKey: 'ownerId' })
  declare ownedChannels: HasMany<typeof Channel>

  // channels I am a member of or invited to (channel_members.status)
  @manyToMany(() => Channel, {
    pivotTable: 'channel_members',
    pivotColumns: ['status', 'invited_by_id', 'joined_at'],
    pivotTimestamps: { createdAt: 'created_at', updatedAt: false },
  })
  declare channels: ManyToMany<typeof Channel>

  @hasMany(() => Message, { foreignKey: 'authorId' })
  declare messages: HasMany<typeof Message>

  get initials() {
    return `${this.firstName.charAt(0)}${this.lastName.charAt(0)}`.toUpperCase()
  }
}