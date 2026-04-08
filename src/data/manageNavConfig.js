export const manageNavConfig = [
  { id: 'dashboard', to: '/manage/dashboard', label: 'Dashboard', permission: 'dashboard', mobilePriority: 1 },
  { id: 'events', to: '/manage/events', label: 'My Events', permission: 'events' },
  { id: 'planner', to: '/manage/planner', label: 'Event Planner', permission: 'planner' },
  {
    id: 'registrationOnline',
    to: '/manage/registration-online',
    label: 'Online Registration',
    permission: 'onlineRegistration',
  },
  {
    id: 'registrationOnsite',
    to: '/manage/registration-onsite',
    label: 'On-site Registration',
    permission: 'onsiteRegistration',
  },
  { id: 'checkin', to: '/manage/checkin', label: 'Check-in', permission: 'checkin', mobilePriority: 2 },
  { id: 'guests', to: '/manage/guests', label: 'Guests', permission: 'guests', mobilePriority: 3 },
  { id: 'seating', to: '/manage/seating', label: 'Seating', permission: 'seating', mobilePriority: 4 },
  { id: 'qr', to: '/manage/qr', label: 'QR Tools', permission: 'qr' },
  { id: 'staff', to: '/manage/staff', label: 'Staff', permission: 'staff' },
  { id: 'incidents', to: '/manage/incidents', label: 'Incidents', permission: 'incidents' },
  { id: 'waitlist', to: '/manage/waitlist', label: 'Waitlist', permission: 'waitlist' },
  { id: 'analytics', to: '/manage/analytics', label: 'Analytics', permission: 'analytics' },
  { id: 'audit', to: '/manage/audit', label: 'Audit Trail', permission: 'audit' },
]

export const manageMobileCoreIds = ['dashboard', 'checkin', 'guests', 'seating']
