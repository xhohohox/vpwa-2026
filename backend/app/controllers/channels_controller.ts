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

  async accept({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const channel = await Channel.findByOrFail('name', params.name)

    const invitation = channel
      .related('users')
      .pivotQuery()
      .where('user_id', user.id)
      .where('status', 'invited')

    if (!(await invitation.clone().first())) {
      return response.notFound({ errors: [{ message: `No invitation to #${channel.name}` }] })
    }
    await invitation.update({ status: 'member', joined_at: new Date() })

    return response.noContent()
  }

  async leave({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const channel = await Channel.findByOrFail('name', params.name)

    if (channel.ownerId === user.id) await channel.delete()
    else await channel.related('users').detach([user.id])

    return response.noContent()
  }

  async destroy({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const channel = await Channel.findByOrFail('name', params.name)

    if (channel.ownerId !== user.id) {
      return response.forbidden({ errors: [{ message: 'Only the admin can delete the channel' }] })
    }
    await channel.delete()

    return response.noContent()
  }
}
