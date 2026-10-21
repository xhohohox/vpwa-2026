import type User from '#models/user'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class UserTransformer extends BaseTransformer<User> {
  toObject() {
    // the password is never sent (serializeAs: null in the schema)
    return this.pick(this.resource, [
      'id',
      'firstName',
      'lastName',
      'nickName',
      'email',
      'status',
      'notifyMentionsOnly',
      'createdAt',
      'updatedAt',
      'initials',
    ])
  }
}
