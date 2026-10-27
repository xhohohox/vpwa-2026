import { DateTime } from 'luxon'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import Channel from '#models/channel'
import Message from '#models/message'
import KickVote from '#models/kick_vote'
import ChannelBan from '#models/channel_ban'

/**
 * Demo data, the same as in the frontend prototype (quasar/src/data/mock.js).
 * Every user can log in with <nickName>@vpwa.test and the password "password123".
 * Run with: node ace migration:fresh --seed
 */
export default class extends BaseSeeder {
  async run() {
    const people = [
      ['bondra2002', 'Peter', 'Bondra', 'online'],
      ['zigo', 'Zigmund', 'Palffy', 'online'],
      ['demitra', 'Pavol', 'Demitra', 'dnd'],
      ['satan', 'Miroslav', 'Satan', 'online'],
      ['ed', 'Edo', 'Novak', 'offline'],
      ['troll', 'Tom', 'Troll', 'online'],
    ] as const

    const users = await User.createMany(
      people.map(([nickName, firstName, lastName, status]) => ({
        nickName,
        firstName,
        lastName,
        status,
        email: `${nickName}@vpwa.test`,
        password: 'password123',
      }))
    )
    const [bondra, zigo, demitra, satan, ed, troll] = users

    const now = DateTime.now()
    const member = { status: 'member', joined_at: now.toSQL() }

    const general = await Channel.create({ name: 'general', type: 'public', ownerId: zigo.id })
    await general.related('users').attach({
      [zigo.id]: member,
      [demitra.id]: member,
      [bondra.id]: member,
      [troll.id]: member,
    })

    const vpwa = await Channel.create({ name: 'vpwa', type: 'public', ownerId: bondra.id })
    await vpwa
      .related('users')
      .attach({ [bondra.id]: member, [demitra.id]: member, [ed.id]: member })

    const team = await Channel.create({ name: 'team', type: 'private', ownerId: bondra.id })
    await team.related('users').attach({ [bondra.id]: member, [satan.id]: member })

    // bondra2002 has a pending invitation (highlighted at the top of his list)
    const random = await Channel.create({ name: 'random', type: 'public', ownerId: demitra.id })
    await random.related('users').attach({
      [demitra.id]: member,
      [zigo.id]: member,
      [bondra.id]: { status: 'invited', invited_by_id: demitra.id },
    })

    // channels bondra2002 is not in, to try /join
    const hokej = await Channel.create({ name: 'hokej', type: 'public', ownerId: satan.id })
    await hokej.related('users').attach({ [satan.id]: member, [zigo.id]: member })

    const tajne = await Channel.create({ name: 'tajne', type: 'private', ownerId: zigo.id })
    await tajne.related('users').attach({ [zigo.id]: member })

    const spam = await Channel.create({ name: 'spam', type: 'public', ownerId: troll.id })
    await spam.related('users').attach({ [troll.id]: member })
    await ChannelBan.create({ channelId: spam.id, userId: bondra.id, bannedById: troll.id })

    // two members already voted to kick troll from #general, a third vote bans him
    await KickVote.createMany([
      { channelId: general.id, targetUserId: troll.id, voterId: zigo.id },
      { channelId: general.id, targetUserId: troll.id, voterId: demitra.id },
    ])

    // older history of #general for the infinite scroll
    const authors = [zigo, demitra, bondra]
    const start = now.minus({ days: 7 })
    await Message.createMany(
      Array.from({ length: 60 }, (_, i) => ({
        channelId: general.id,
        authorId: authors[i % 3].id,
        content: `Sprava z historie c. ${i + 1}`,
        createdAt: start.plus({ minutes: i * 7 }),
      }))
    )

    const recent = now.minus({ hours: 2 })
    await Message.createMany([
      { channelId: general.id, authorId: zigo.id, content: 'Caute majstri!', createdAt: recent },
      {
        channelId: general.id,
        authorId: demitra.id,
        content: 'Cau',
        createdAt: recent.plus({ minutes: 5 }),
      },
      {
        channelId: general.id,
        authorId: bondra.id,
        content: 'JJ, daj mi sekundu',
        createdAt: recent.plus({ minutes: 13 }),
      },
      {
        channelId: vpwa.id,
        authorId: demitra.id,
        content: 'Zdravim chlapi, kde nam to strieka.',
        createdAt: recent.plus({ minutes: 20 }),
      },
      {
        channelId: team.id,
        authorId: bondra.id,
        content: 'Privatny kanal len pre tych najlepsich',
        createdAt: recent.plus({ minutes: 30 }),
      },
    ])

    // a message addressed to bondra2002 with @nickname
    const mention = await Message.create({
      channelId: general.id,
      authorId: zigo.id,
      content: '@bondra2002 posles mi pls video z majstrovstiev?',
      createdAt: recent.plus({ minutes: 12 }),
    })
    await mention.related('mentions').attach([bondra.id])
  }
}
