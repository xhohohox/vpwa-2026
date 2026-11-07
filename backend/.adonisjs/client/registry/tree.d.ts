/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  auth: {
    newAccount: {
      store: typeof routes['auth.new_account.store']
    }
    accessTokens: {
      store: typeof routes['auth.access_tokens.store']
    }
  }
  profile: {
    profile: {
      show: typeof routes['profile.profile.show']
      update: typeof routes['profile.profile.update']
    }
    accessTokens: {
      destroy: typeof routes['profile.access_tokens.destroy']
    }
  }
  channels: {
    index: typeof routes['channels.index']
    join: typeof routes['channels.join']
    accept: typeof routes['channels.accept']
    leave: typeof routes['channels.leave']
    destroy: typeof routes['channels.destroy']
  }
  channelMembers: {
    invite: typeof routes['channel_members.invite']
    uninvite: typeof routes['channel_members.uninvite']
    revoke: typeof routes['channel_members.revoke']
    kick: typeof routes['channel_members.kick']
  }
  messages: {
    index: typeof routes['messages.index']
    store: typeof routes['messages.store']
  }
  users: {
    index: typeof routes['users.index']
  }
}
