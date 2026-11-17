export interface AppSocket {

  readonly channels: {

    readonly 'updates': {

      readonly params: undefined

      readonly channel: typeof import('#channels/updates_channel').default

      readonly handlers: {

      }

    }

    readonly 'users/:id': {

      readonly params: {

        readonly 'id': string | number

      }

      readonly channel: typeof import('#channels/user_channel').default

      readonly handlers: {

      }

    }

  }

}

