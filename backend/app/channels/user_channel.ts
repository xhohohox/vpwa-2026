import { BaseChannel, SocketResponseError } from '@rlanz/socket'
import type { MiddlewareContext } from '@rlanz/socket/types'
import type User from '#models/user'

// only the user can listen to their own channel
async function ownChannelOnly(ctx: MiddlewareContext<User>, next: () => Promise<void>) {
  if (ctx.params.id !== String(ctx.socket.getUserOrFail().id)) {
    throw new SocketResponseError('This is not your channel')
  }
  await next()
}

export default class UserChannel extends BaseChannel<User> {
  static pattern = 'users/:id'
  static middlewares = [ownChannelOnly]
}
