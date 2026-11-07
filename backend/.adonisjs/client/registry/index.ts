/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'auth.new_account.store': {
    methods: ["POST"],
    pattern: '/api/v1/auth/signup',
    tokens: [[0,"api"],[0,"v1"],[0,"auth"],[0,"signup"]],
    types: placeholder as Registry['auth.new_account.store']['types'],
  },
  'auth.access_tokens.store': {
    methods: ["POST"],
    pattern: '/api/v1/auth/login',
    tokens: [[0,"api"],[0,"v1"],[0,"auth"],[0,"login"]],
    types: placeholder as Registry['auth.access_tokens.store']['types'],
  },
  'profile.profile.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/account/profile',
    tokens: [[0,"api"],[0,"v1"],[0,"account"],[0,"profile"]],
    types: placeholder as Registry['profile.profile.show']['types'],
  },
  'profile.profile.update': {
    methods: ["PATCH"],
    pattern: '/api/v1/account/profile',
    tokens: [[0,"api"],[0,"v1"],[0,"account"],[0,"profile"]],
    types: placeholder as Registry['profile.profile.update']['types'],
  },
  'profile.access_tokens.destroy': {
    methods: ["POST"],
    pattern: '/api/v1/account/logout',
    tokens: [[0,"api"],[0,"v1"],[0,"account"],[0,"logout"]],
    types: placeholder as Registry['profile.access_tokens.destroy']['types'],
  },
  'channels.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/channels',
    tokens: [[0,"api"],[0,"v1"],[0,"channels"]],
    types: placeholder as Registry['channels.index']['types'],
  },
  'channels.join': {
    methods: ["POST"],
    pattern: '/api/v1/channels',
    tokens: [[0,"api"],[0,"v1"],[0,"channels"]],
    types: placeholder as Registry['channels.join']['types'],
  },
  'channels.accept': {
    methods: ["POST"],
    pattern: '/api/v1/channels/:name/accept',
    tokens: [[0,"api"],[0,"v1"],[0,"channels"],[1,"name"],[0,"accept"]],
    types: placeholder as Registry['channels.accept']['types'],
  },
  'channels.leave': {
    methods: ["POST"],
    pattern: '/api/v1/channels/:name/leave',
    tokens: [[0,"api"],[0,"v1"],[0,"channels"],[1,"name"],[0,"leave"]],
    types: placeholder as Registry['channels.leave']['types'],
  },
  'channels.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/channels/:name',
    tokens: [[0,"api"],[0,"v1"],[0,"channels"],[1,"name"]],
    types: placeholder as Registry['channels.destroy']['types'],
  },
  'channel_members.invite': {
    methods: ["POST"],
    pattern: '/api/v1/channels/:name/invite',
    tokens: [[0,"api"],[0,"v1"],[0,"channels"],[1,"name"],[0,"invite"]],
    types: placeholder as Registry['channel_members.invite']['types'],
  },
  'channel_members.uninvite': {
    methods: ["POST"],
    pattern: '/api/v1/channels/:name/uninvite',
    tokens: [[0,"api"],[0,"v1"],[0,"channels"],[1,"name"],[0,"uninvite"]],
    types: placeholder as Registry['channel_members.uninvite']['types'],
  },
  'channel_members.revoke': {
    methods: ["POST"],
    pattern: '/api/v1/channels/:name/revoke',
    tokens: [[0,"api"],[0,"v1"],[0,"channels"],[1,"name"],[0,"revoke"]],
    types: placeholder as Registry['channel_members.revoke']['types'],
  },
  'channel_members.kick': {
    methods: ["POST"],
    pattern: '/api/v1/channels/:name/kick',
    tokens: [[0,"api"],[0,"v1"],[0,"channels"],[1,"name"],[0,"kick"]],
    types: placeholder as Registry['channel_members.kick']['types'],
  },
  'messages.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/channels/:name/messages',
    tokens: [[0,"api"],[0,"v1"],[0,"channels"],[1,"name"],[0,"messages"]],
    types: placeholder as Registry['messages.index']['types'],
  },
  'messages.store': {
    methods: ["POST"],
    pattern: '/api/v1/channels/:name/messages',
    tokens: [[0,"api"],[0,"v1"],[0,"channels"],[1,"name"],[0,"messages"]],
    types: placeholder as Registry['messages.store']['types'],
  },
  'users.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/users',
    tokens: [[0,"api"],[0,"v1"],[0,"users"]],
    types: placeholder as Registry['users.index']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
