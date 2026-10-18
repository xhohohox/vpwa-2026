// Sample data for the clickable prototype (phase 1), replaced by the backend later.
// reactive() makes the data shared state: when the command line in the layout
// adds a message, every component that imports `messages` re-renders.
import { reactive } from 'vue'

export const currentUser = reactive({
  firstName: 'Peter',
  lastName: 'Bondra',
  nickName: 'bondra2002',
  email: 'peter.bondra@smemajstri.com',
  status: 'online',
  notifyMentionsOnly: false
})

// Other registered users and their status, shown in the member list (use case 9)
export const users = reactive([
  { nickName: 'zigo', status: 'online' },
  { nickName: 'demitra', status: 'dnd' },
  { nickName: 'satan', status: 'online' },
  { nickName: 'ed', status: 'offline' },
  { nickName: 'troll', status: 'online' }
])

// Channels in my list. Like the tables in the data model, every channel has
// its members, banned users and votes to kick someone ({ nickName: [voters] }).
export const channels = reactive([
  {
    name: 'general',
    isPrivate: false,
    owner: 'zigo',
    invited: false,
    members: ['zigo', 'demitra', 'bondra2002', 'troll'],
    invites: [],
    banned: [],
    // two members already voted to kick troll, the third vote bans him
    kickVotes: { troll: ['zigo', 'demitra'] }
  },
  {
    name: 'vpwa',
    isPrivate: false,
    owner: 'bondra2002',
    invited: false,
    members: ['bondra2002', 'demitra', 'ed'],
    invites: [],
    banned: [],
    kickVotes: {}
  },
  {
    name: 'team',
    isPrivate: true,
    owner: 'bondra2002',
    invited: false,
    members: ['bondra2002', 'satan'],
    invites: [],
    banned: [],
    kickVotes: {}
  },
  {
    name: 'random',
    isPrivate: false,
    owner: 'demitra',
    invited: true,
    members: ['demitra', 'zigo'],
    invites: ['bondra2002'],
    banned: [],
    kickVotes: {}
  }
])

// Existing channels I am not in, so /join has something to join
export const otherChannels = reactive([
  {
    name: 'hokej',
    isPrivate: false,
    owner: 'satan',
    invited: false,
    members: ['satan', 'zigo'],
    invites: [],
    banned: [],
    kickVotes: {}
  },
  {
    name: 'tajne',
    isPrivate: true,
    owner: 'zigo',
    invited: false,
    members: ['zigo'],
    invites: [],
    banned: [],
    kickVotes: {}
  },
  {
    name: 'spam',
    isPrivate: false,
    owner: 'troll',
    invited: false,
    members: ['troll'],
    invites: [],
    banned: ['bondra2002'],
    kickVotes: {}
  }
])

// New messages get ids from a counter, so an id is never used twice
let lastMessageId = 1000
export const nextMessageId = () => ++lastMessageId

// Older history of #general, so the infinite scroll has something to load
// (use case 7). Negative ids never clash with the new ones.
const history = Array.from({ length: 60 }, (_, i) => ({
  id: -(60 - i),
  channel: 'general',
  author: ['zigo', 'demitra', 'bondra2002'][i % 3],
  text: `Sprava z historie c. ${i + 1}`,
  createdAt: new Date(2026, 8, 20, 8, i * 7) // from 20. 9., every 7 minutes
}))

export const messages = reactive([
  ...history,
  {
    id: 1,
    channel: 'general',
    author: 'zigo',
    text: 'Caute majstri!',
    createdAt: new Date('2026-09-28T09:00')
  },
  {
    id: 2,
    channel: 'general',
    author: 'demitra',
    text: 'Cau',
    createdAt: new Date('2026-09-28T09:05')
  },
  {
    id: 3,
    channel: 'general',
    author: 'zigo',
    text: '@bondra2002 posles mi pls video z majstrovstiev?',
    createdAt: new Date('2026-09-28T09:12')
  },
  {
    id: 4,
    channel: 'general',
    author: 'bondra2002',
    text: 'JJ, daj mi sekundu',
    createdAt: new Date('2026-09-28T09:13')
  },
  {
    id: 5,
    channel: 'vpwa',
    author: 'demitra',
    text: 'Zdravim chlapi, kde nam to strieka.',
    createdAt: new Date('2026-09-28T10:30')
  },
  {
    id: 6,
    channel: 'team',
    author: 'bondra2002',
    text: 'Privatny kanal len pre tych najlepsich',
    createdAt: new Date('2026-09-28T11:00')
  }
])

// Users who are typing right now: { channel, nickName, draft }
export const typing = reactive([])