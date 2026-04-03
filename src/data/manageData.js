export const manageEvents = [
  {
    id: 'm-evt-001',
    title: 'Santos Family Reunion 2026',
    city: 'Davao City',
    venue: 'SMX Davao Convention Center, Hall B',
    date: '2026-06-15',
    status: 'live',
    guestCapacity: 250,
    tables: [
      { id: 't-1', label: 'T1', capacity: 10 },
      { id: 't-2', label: 'T2', capacity: 10 },
      { id: 't-3', label: 'T3', capacity: 10 },
      { id: 't-4', label: 'T4', capacity: 10 },
      { id: 't-5', label: 'T5', capacity: 10 },
      { id: 't-6', label: 'T6', capacity: 10 },
    ],
  },
  {
    id: 'm-evt-002',
    title: 'Dela Cruz Wedding',
    city: 'Davao City',
    venue: 'Marco Polo Grand Ballroom',
    date: '2026-07-04',
    status: 'upcoming',
    guestCapacity: 180,
    tables: [
      { id: 't-1', label: 'VIP-1', capacity: 10 },
      { id: 't-2', label: 'VIP-2', capacity: 10 },
      { id: 't-3', label: 'G-1', capacity: 10 },
      { id: 't-4', label: 'G-2', capacity: 10 },
      { id: 't-5', label: 'G-3', capacity: 10 },
    ],
  },
  {
    id: 'm-evt-003',
    title: 'Davao Tech Summit 2026',
    city: 'Davao City',
    venue: 'SMX Hall A',
    date: '2026-07-22',
    status: 'upcoming',
    guestCapacity: 350,
    tables: [
      { id: 't-1', label: 'A1', capacity: 12 },
      { id: 't-2', label: 'A2', capacity: 12 },
      { id: 't-3', label: 'A3', capacity: 12 },
      { id: 't-4', label: 'A4', capacity: 12 },
      { id: 't-5', label: 'A5', capacity: 12 },
      { id: 't-6', label: 'A6', capacity: 12 },
    ],
  },
]

export const manageGuestsByEvent = {
  'm-evt-001': [
    { id: 'g-001', name: 'Ana Reyes', ticketType: 'VIP', tableLabel: 'T1', phone: '+63 912 111 2222', checkedInAt: '2026-06-15T10:03:00.000Z', checkInSource: 'qr', isWalkIn: false },
    { id: 'g-002', name: 'Pedro Santos', ticketType: 'General', tableLabel: 'T4', phone: '+63 917 333 4444', checkedInAt: '2026-06-15T10:04:00.000Z', checkInSource: 'manual', isWalkIn: false },
    { id: 'g-003', name: 'Maria Gomez', ticketType: 'VIP', tableLabel: 'T2', phone: '+63 918 555 6666', checkedInAt: null, checkInSource: null, isWalkIn: false },
    { id: 'g-004', name: 'Juan Cruz', ticketType: 'General', tableLabel: 'T6', phone: '+63 919 777 8888', checkedInAt: null, checkInSource: null, isWalkIn: false },
    { id: 'g-005', name: 'Liza Mangubat', ticketType: 'Staff', tableLabel: null, phone: '+63 920 999 0000', checkedInAt: '2026-06-15T10:05:00.000Z', checkInSource: 'qr', isWalkIn: false },
    { id: 'g-006', name: 'Carlos Reyes', ticketType: 'General', tableLabel: 'T4', phone: '+63 921 000 1111', checkedInAt: null, checkInSource: null, isWalkIn: false },
    { id: 'g-007', name: 'Sheila Lim', ticketType: 'VIP', tableLabel: 'T2', phone: '+63 922 222 3333', checkedInAt: null, checkInSource: null, isWalkIn: false },
    { id: 'g-008', name: 'Ramon Aquino', ticketType: 'General', tableLabel: 'T5', phone: '+63 923 444 5555', checkedInAt: null, checkInSource: null, isWalkIn: false },
  ],
  'm-evt-002': [
    { id: 'g-201', name: 'Cheska Dela Cruz', ticketType: 'VIP', tableLabel: 'VIP-1', phone: '+63 905 100 0001', checkedInAt: null, checkInSource: null, isWalkIn: false },
    { id: 'g-202', name: 'Miko Dela Cruz', ticketType: 'VIP', tableLabel: 'VIP-2', phone: '+63 905 100 0002', checkedInAt: null, checkInSource: null, isWalkIn: false },
    { id: 'g-203', name: 'Grace Lim', ticketType: 'General', tableLabel: 'G-1', phone: '+63 905 100 0003', checkedInAt: null, checkInSource: null, isWalkIn: false },
  ],
  'm-evt-003': [
    { id: 'g-301', name: 'Davao Startup Guild', ticketType: 'Sponsor', tableLabel: 'A1', phone: '+63 905 200 0001', checkedInAt: null, checkInSource: null, isWalkIn: false },
    { id: 'g-302', name: 'Mina Solutions', ticketType: 'Delegate', tableLabel: 'A3', phone: '+63 905 200 0002', checkedInAt: null, checkInSource: null, isWalkIn: false },
    { id: 'g-303', name: 'Dev Ops Circle', ticketType: 'Delegate', tableLabel: 'A4', phone: '+63 905 200 0003', checkedInAt: null, checkInSource: null, isWalkIn: false },
  ],
}

export const manageStaffByEvent = {
  'm-evt-001': [
    { id: 's-001', name: 'Lito Lagbas', role: 'admin', station: 'Control Desk', status: 'active' },
    { id: 's-002', name: 'Ana Corpuz', role: 'seatingLead', station: 'Hall B', status: 'active' },
    { id: 's-003', name: 'Pedro Garcia', role: 'checkinLead', station: 'Gate 1', status: 'active' },
    { id: 's-004', name: 'Lyn Rojas', role: 'staff', station: 'Gate 2', status: 'active' },
    { id: 's-005', name: 'Mike Torres', role: 'staff', station: 'Reception', status: 'inactive' },
  ],
  'm-evt-002': [
    { id: 's-201', name: 'Wedding Captain', role: 'admin', station: 'Main Hall', status: 'active' },
    { id: 's-202', name: 'Host Liaison', role: 'staff', station: 'Lobby', status: 'active' },
  ],
  'm-evt-003': [
    { id: 's-301', name: 'Summit Director', role: 'admin', station: 'Control Room', status: 'active' },
    { id: 's-302', name: 'Registration Lead', role: 'checkinLead', station: 'Registration Desk', status: 'active' },
  ],
}

export const manageIncidentsByEvent = {
  'm-evt-001': [
    {
      id: 'inc-001',
      type: 'medical',
      severity: 'high',
      status: 'resolved',
      title: 'Guest with dizziness near Gate 2',
      note: 'First aid team responded. Guest stabilized and seated.',
      reportedBy: 'Ana Corpuz',
      reportedAt: '2026-06-15T10:15:00.000Z',
    },
    {
      id: 'inc-002',
      type: 'logistics',
      severity: 'medium',
      status: 'open',
      title: 'Buffet queue congested near Hall B aisle',
      note: 'Need floor marshal to guide queue split.',
      reportedBy: 'Pedro Garcia',
      reportedAt: '2026-06-15T10:21:00.000Z',
    },
  ],
  'm-evt-002': [],
  'm-evt-003': [],
}

export const manageWaitlistByEvent = {
  'm-evt-001': [
    {
      id: 'wl-001',
      name: 'Rizza Mendoza',
      ticketType: 'General',
      phone: '+63 924 111 2222',
      status: 'waiting',
      requestedAt: '2026-06-15T10:28:00.000Z',
    },
    {
      id: 'wl-002',
      name: 'Bong Castillo',
      ticketType: 'VIP',
      phone: '+63 925 333 4444',
      status: 'waiting',
      requestedAt: '2026-06-15T10:31:00.000Z',
    },
  ],
  'm-evt-002': [],
  'm-evt-003': [],
}

export const manageAuditLogByEvent = {
  'm-evt-001': [
    {
      id: 'audit-001',
      module: 'checkin',
      action: 'guest_checked_in',
      summary: 'Ana Reyes checked in via QR.',
      actorRole: 'checkinLead',
      createdAt: '2026-06-15T10:03:10.000Z',
      severity: 'info',
    },
    {
      id: 'audit-002',
      module: 'incidents',
      action: 'incident_opened',
      summary: 'Buffet queue congestion reported.',
      actorRole: 'admin',
      createdAt: '2026-06-15T10:21:10.000Z',
      severity: 'warning',
    },
  ],
  'm-evt-002': [],
  'm-evt-003': [],
}
