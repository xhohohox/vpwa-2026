import Channel from '#models/channel'
import Message from '#models/message'
import MessageTransformer from '#transformers/message_transformer'
import { messageValidator } from '#validators/channel'
import { pushMessage } from '#services/push'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

const PAGE_SIZE = 20

export default class MessagesController {
  // the newest page of the history, older pages with ?before=id for the infinite scroll (use case 7), the messages that came after ?after=id
  async index({ auth, params, request, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const channel = await Channel.findByNameOrFail(params.name)
    await channel.mustBeMember(user)

    const before = Number(request.input('before')) || 0
    const after = Number(request.input('after')) || 0

    const query = Message.query()
      .where('channel_id', channel.id)
      .preload('channel')
      .preload('author')
      .preload('mentions')

    if (after) {
      const newer = await query.where('id', '>', after).orderBy('id', 'asc')
      return serialize(MessageTransformer.transform(newer))
    }

    if (before) query.where('id', '<', before)
    const page = await query.orderBy('id', 'desc').limit(PAGE_SIZE)
    return serialize(MessageTransformer.transform(page.reverse()))
  }

  // a message in a channel I am a member of (use case 3), @nickname of a member addresses it to them (use case 6)
  async store({ auth, params, request, serialize }: HttpContext) {
    const user = auth.getUserOrFail()
    const channel = await Channel.findByNameOrFail(params.name)
    await channel.mustBeMember(user)
    const { text } = await request.validateUsing(messageValidator)

    const message = await Message.create({
      channelId: channel.id,
      authorId: user.id,
      content: text,
    })

    const members = await channel.related('users').query().wherePivot('status', 'member')

    // "@zigo, ahoj" -> zigo
    const nickNames = [...text.matchAll(/@([^\s.,!?;:]+)/g)].map((match) => match[1])
    const mentioned = members.filter((member) => nickNames.includes(member.nickName))
    await message.related('mentions').attach(mentioned.map((member) => member.id))

    // the channel is active, so it does not cease after 30 days (use case 2)
    channel.lastActivityAt = DateTime.now()
    await channel.save()

    await message.load('channel')
    await message.load('author')
    await message.load('mentions')
    const body = await serialize(MessageTransformer.transform(message))

    // the members get the message at once over their websocket, an offline user
    // gets nothing until going online again (use case 9)
    for (const member of members) {
      if (member.status !== 'offline') pushMessage(member, body.data)
    }
    return body
  }
}
