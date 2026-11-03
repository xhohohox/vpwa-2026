import Channel from '#models/channel'
import ChannelTransformer from '#transformers/channel_transformer'
import type { HttpContext } from '@adonisjs/core/http'

export default class ChannelsController {
  async index({ auth, serialize }: HttpContext) {
    const user = auth.getUserOrFail()

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
}
