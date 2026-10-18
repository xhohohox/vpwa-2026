// User status (use case 9): DND pauses notifications, offline pauses messages
export const statusOptions = [
  { value: 'online', label: 'Online', color: 'green' },
  {
    value: 'dnd',
    label: 'Do not disturb',
    color: 'red',
    description: 'No notifications'
  },
  {
    value: 'offline',
    label: 'Offline',
    color: 'grey',
    description: 'No new messages'
  }
]

export const statusColor = status =>
  statusOptions.find(option => option.value === status).color