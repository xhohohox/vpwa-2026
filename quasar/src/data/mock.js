// Shared app state. Users and channels come from the server, the messages
// are still sample data from the prototype (phase 1).
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
// [{ nickName, status }], loaded from the server (services/channels.js)
export const users = reactive([])

// Channels in my list, loaded from the server (services/channels.js). Like the
// tables in the data model, every channel has its members, banned users and
// votes to kick someone ({ nickName: [voters] }).
// invited  - [nickName, inviter] pairs with a pending invitation
export const channels = reactive([])

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