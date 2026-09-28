// Sample data for the clickable prototype (phase 1), replaced by the backend later.
// reactive() makes the arrays shared state: when the command line in the layout
// adds a message, every component that imports `messages` re-renders.
import { reactive } from 'vue'

export const currentUser = {
  firstName: 'Peter',
  lastName: 'Bondra',
  nickName: 'bondra2002',
  email: 'peter.bondra@smemajstri.com'
}

export const channels = reactive([
  { name: 'general', isPrivate: false, owner: 'zigo', invited: false },
  { name: 'vpwa', isPrivate: false, owner: 'bondra2002', invited: false },
  { name: 'team', isPrivate: true, owner: 'bondra2002', invited: false },
  { name: 'random', isPrivate: false, owner: 'demitra', invited: true }
])

export const messages = reactive([
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