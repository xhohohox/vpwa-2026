/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

router.get('/', () => {
  return { hello: 'world' }
})

router
  .group(() => {
    router
      .group(() => {
        router.post('signup', [controllers.NewAccount, 'store'])
        router.post('login', [controllers.AccessTokens, 'store'])
      })
      .prefix('auth')
      .as('auth')

    router
      .group(() => {
        router.get('profile', [controllers.Profile, 'show'])
        router.patch('profile', [controllers.Profile, 'update'])
        router.post('logout', [controllers.AccessTokens, 'destroy'])
      })
      .prefix('account')
      .as('profile')
      .use(middleware.auth())

    router
      .group(() => {
        router.get('channels', [controllers.Channels, 'index'])
        router.post('channels', [controllers.Channels, 'join'])
        router.post('channels/:name/accept', [controllers.Channels, 'accept'])
        router.post('channels/:name/leave', [controllers.Channels, 'leave'])
        router.delete('channels/:name', [controllers.Channels, 'destroy'])

        router.post('channels/:name/invite', [controllers.ChannelMembers, 'invite'])
        router.post('channels/:name/uninvite', [controllers.ChannelMembers, 'uninvite'])
        router.post('channels/:name/revoke', [controllers.ChannelMembers, 'revoke'])
        router.post('channels/:name/kick', [controllers.ChannelMembers, 'kick'])

        router.get('channels/:name/messages', [controllers.Messages, 'index'])
        router.post('channels/:name/messages', [controllers.Messages, 'store'])

        router.get('users', [controllers.Users, 'index'])
      })
      .use(middleware.auth())
  })
  .prefix('/api/v1')
