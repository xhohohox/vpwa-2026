import type Channel from '#models/channel'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class ChannelTransformer extends BaseTransformer<Channel> {
  toObject() {
    const channel = this.resource

    // channel_members.status tells members and invited users apart
    const withStatus = (status: string) =>
      channel.users.filter((user) => user.$extras.pivot_status === status)
    const nickOf = (id: number | null) =>
      channel.users.find((user) => user.id === id)?.nickName ?? null

    // { target: [voters] }
    const kickVotes: Record<string, string[]> = {}
    for (const vote of channel.kickVotes) {
      kickVotes[vote.target.nickName] ??= []
      kickVotes[vote.target.nickName].push(vote.voter.nickName)
    }

    return {
      name: channel.name,
      isPrivate: channel.type === 'private',
      owner: channel.owner.nickName,
      members: withStatus('member').map((user) => user.nickName),
      // [nickName, inviter] pairs
      invited: withStatus('invited').map((user) => [
        user.nickName,
        nickOf(user.$extras.pivot_invited_by_id),
      ]),
      banned: channel.bans.map((ban) => ban.user.nickName),
      kickVotes,
    }
  }
}
