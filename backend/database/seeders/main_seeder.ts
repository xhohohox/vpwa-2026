import { DateTime } from 'luxon'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import Channel from '#models/channel'
import Message from '#models/message'
import KickVote from '#models/kick_vote'
import ChannelBan from '#models/channel_ban'

/**
 * Demo data for the chat use cases. The main account is bondra2002:
 * every user can log in with <nickName>@vpwa.test and the password "password123".
 * Run with: node ace migration:fresh --seed
 *
 * bondra2002's channel list shows:
 *  - public and private channels he is a member of
 *  - an admin role in #vpwa, #team, #moderation and #sandbox
 *  - pending invitations to a public (#random) and a private (#board) channel
 *  - two kick votes against him in #lobby (the third vote bans him)
 *  - a 60-message history in #general for infinite scrolling
 *  - a channel with an empty history (#sandbox)
 *
 * Other channels are there for /join:
 *  - #hokej is public and joinable
 *  - #tajne is private, so it needs an invitation
 *  - #spam has bondra2002 banned
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
    const invited = (by: User) => ({ status: 'invited', invited_by_id: by.id })

    // #general - public channel, bondra2002 is a member. It has a long history,
    // a mention of bondra2002 and two votes to kick troll.
    const general = await Channel.create({
      name: 'general',
      type: 'public',
      ownerId: zigo.id,
      lastActivityAt: now.minus({ hours: 2 }).plus({ minutes: 12 }),
    })
    await general.related('users').attach({
      [zigo.id]: member,
      [demitra.id]: member,
      [bondra.id]: member,
      [troll.id]: member,
    })
    // two members already voted to kick troll, so bondra2002 can cast the
    // third vote and ban him (use case 4)
    await KickVote.createMany([
      { channelId: general.id, targetUserId: troll.id, voterId: zigo.id },
      { channelId: general.id, targetUserId: troll.id, voterId: demitra.id },
    ])

    // #lobby - public channel where bondra2002 is the target of a kick vote.
    const lobby = await Channel.create({
      name: 'lobby',
      type: 'public',
      ownerId: satan.id,
      lastActivityAt: now.minus({ minutes: 50 }),
    })
    await lobby.related('users').attach({
      [satan.id]: member,
      [zigo.id]: member,
      [demitra.id]: member,
      [bondra.id]: member,
    })
    await KickVote.createMany([
      { channelId: lobby.id, targetUserId: bondra.id, voterId: zigo.id },
      { channelId: lobby.id, targetUserId: bondra.id, voterId: demitra.id },
    ])

    // #vpwa - public channel created by bondra2002, so he is the admin.
    const vpwa = await Channel.create({
      name: 'vpwa',
      type: 'public',
      ownerId: bondra.id,
      lastActivityAt: now.minus({ hours: 2, minutes: 55 }),
    })
    await vpwa.related('users').attach({
      [bondra.id]: member,
      [demitra.id]: member,
      [ed.id]: member,
    })

    // #team - private channel owned by bondra2002. He can invite and revoke,
    // ed has a pending invitation that can be taken back.
    const team = await Channel.create({
      name: 'team',
      type: 'private',
      ownerId: bondra.id,
      lastActivityAt: now.minus({ hours: 4 }),
    })
    await team.related('users').attach({
      [bondra.id]: member,
      [satan.id]: member,
      [ed.id]: invited(bondra),
    })

    // #moderation - bondra2002 is the admin and troll is banned. /invite troll
    // lifts the ban, which shows the admin moderation use case.
    const moderation = await Channel.create({
      name: 'moderation',
      type: 'public',
      ownerId: bondra.id,
      lastActivityAt: now.minus({ hours: 7 }),
    })
    await moderation.related('users').attach({
      [bondra.id]: member,
      [zigo.id]: member,
      [demitra.id]: member,
    })
    await ChannelBan.create({
      channelId: moderation.id,
      userId: troll.id,
      bannedById: bondra.id,
    })

    // #random - public channel with a pending invitation for bondra2002.
    // Invitations are highlighted at the top of the channel list.
    const random = await Channel.create({
      name: 'random',
      type: 'public',
      ownerId: demitra.id,
      lastActivityAt: now.minus({ days: 1 }),
    })
    await random.related('users').attach({
      [demitra.id]: member,
      [zigo.id]: member,
      [bondra.id]: invited(demitra),
    })

    // #board - private channel with a pending invitation for bondra2002.
    // Accepting it is the only way in, because the channel is private.
    const board = await Channel.create({
      name: 'board',
      type: 'private',
      ownerId: zigo.id,
      lastActivityAt: now.minus({ days: 2 }),
    })
    await board.related('users').attach({
      [zigo.id]: member,
      [satan.id]: member,
      [bondra.id]: invited(zigo),
    })

    // #hokej - public channel bondra2002 is not in, so /join hokej works.
    const hokej = await Channel.create({
      name: 'hokej',
      type: 'public',
      ownerId: satan.id,
      lastActivityAt: now.minus({ days: 2, hours: 20 }),
    })
    await hokej.related('users').attach({
      [satan.id]: member,
      [zigo.id]: member,
    })

    // #tajne - private channel bondra2002 is not in and has no invitation,
    // so /join tajne is rejected until a member invites him.
    const tajne = await Channel.create({
      name: 'tajne',
      type: 'private',
      ownerId: zigo.id,
      lastActivityAt: now.minus({ days: 4 }),
    })
    await tajne.related('users').attach({
      [zigo.id]: member,
    })

    // #spam - bondra2002 is permanently banned, so /join spam is rejected.
    // The admin (troll) can unban him with /invite bondra2002.
    const spam = await Channel.create({
      name: 'spam',
      type: 'public',
      ownerId: troll.id,
      lastActivityAt: now.minus({ days: 5 }),
    })
    await spam.related('users').attach({
      [troll.id]: member,
    })
    await ChannelBan.create({
      channelId: spam.id,
      userId: bondra.id,
      bannedById: troll.id,
    })

    // #sandbox - bondra2002's own empty channel, to show the "No messages yet"
    // state and the admin menu (delete channel).
    const sandbox = await Channel.create({
      name: 'sandbox',
      type: 'public',
      ownerId: bondra.id,
      lastActivityAt: now.minus({ days: 6 }),
    })
    await sandbox.related('users').attach({
      [bondra.id]: member,
    })

    // #general history for the infinite scroll (use case 7).
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
      { channelId: general.id, authorId: demitra.id, content: 'Cau', createdAt: recent.plus({ minutes: 5 }) },
      {
        channelId: general.id,
        authorId: bondra.id,
        content: 'JJ, daj mi sekundu',
        createdAt: recent.plus({ minutes: 13 }),
      },
      {
        channelId: lobby.id,
        authorId: satan.id,
        content: 'Hlasujeme o tom, ci bondra2002 patri do #lobby.',
        createdAt: now.minus({ hours: 6 }),
      },
      {
        channelId: lobby.id,
        authorId: zigo.id,
        content: 'Som za kick, sprava sa ako troll.',
        createdAt: now.minus({ hours: 5, minutes: 55 }),
      },
      {
        channelId: lobby.id,
        authorId: demitra.id,
        content: '@bondra2002 mas este jednu sancu.',
        createdAt: now.minus({ hours: 5, minutes: 50 }),
      },
      {
        channelId: vpwa.id,
        authorId: demitra.id,
        content: 'Zdravim chlapi, kde nam to strieka.',
        createdAt: now.minus({ hours: 3 }),
      },
      {
        channelId: vpwa.id,
        authorId: bondra.id,
        content: '@demitra vsetko bezi, backend je nastaveny.',
        createdAt: now.minus({ hours: 2, minutes: 55 }),
      },
      {
        channelId: team.id,
        authorId: bondra.id,
        content: 'Privatny kanal len pre tych najlepsich',
        createdAt: now.minus({ hours: 4 }),
      },
      {
        channelId: moderation.id,
        authorId: bondra.id,
        content: 'troll dostal ban, /invite troll ho moze zrusit.',
        createdAt: now.minus({ hours: 7 }),
      },
      {
        channelId: random.id,
        authorId: demitra.id,
        content: 'Vitaj v #random, prijmi pozvanku v zozname kanalov.',
        createdAt: now.minus({ days: 1 }),
      },
      {
        channelId: board.id,
        authorId: zigo.id,
        content: 'Soukroma schodza len pre pozvanych.',
        createdAt: now.minus({ days: 2 }),
      },
      {
        channelId: hokej.id,
        authorId: satan.id,
        content: 'Dnes vecer hrame, /join hokej a pridaj sa.',
        createdAt: now.minus({ days: 2, hours: 20 }),
      },
      {
        channelId: tajne.id,
        authorId: zigo.id,
        content: 'Sem sa dostane len clovek s pozvankou.',
        createdAt: now.minus({ days: 4 }),
      },
      {
        channelId: spam.id,
        authorId: troll.id,
        content: 'Spam spam spam, bondra2002 je tu banovany.',
        createdAt: now.minus({ days: 5 }),
      },
    ])

    // A message addressed to bondra2002 with @nickname (use case 6).
    const mention = await Message.create({
      channelId: general.id,
      authorId: zigo.id,
      content: '@bondra2002 posles mi pls video z majstrovstiev?',
      createdAt: recent.plus({ minutes: 12 }),
    })
    await mention.related('mentions').attach([bondra.id])
  }
}
