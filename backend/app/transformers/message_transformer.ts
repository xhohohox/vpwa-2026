import type Message from '#models/message'
import { BaseTransformer } from '@adonisjs/core/transformers'

/**
 * A message in the same shape as in the frontend, users by their nickName.
 * Needs the channel, author and mentions preloaded (MessagesController).
 */
export default class MessageTransformer extends BaseTransformer<Message> {
  toObject() {
    const message = this.resource
    return {
      id: message.id,
      channel: message.channel.name,
      author: message.author.nickName,
      text: message.content,
      createdAt: message.createdAt,
      // users addressed with @nickname
      mentions: message.mentions.map((user) => user.nickName),
    }
  }
}
