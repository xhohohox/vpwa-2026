import { BaseChannel } from '@rlanz/socket'
import type User from '#models/user'

export default class UpdatesChannel extends BaseChannel<User> {
  static pattern = 'updates'
}
