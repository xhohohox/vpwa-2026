// Shared app state, the users, channels and messages come from the server.
// reactive() makes the data shared state: when the command line in the layout
// adds a message, every component that imports `messages` re-renders.
import { reactive } from 'vue'

export const currentUser = reactive({
  id: null,
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

// Messages of the open channel, loaded from the server (services/messages.js)
// { id, channel, author, text, createdAt, mentions }
export const messages = reactive([])

// Users who are typing right now: { channel, nickName, draft }
export const typing = reactive([])