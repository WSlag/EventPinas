export const checklistPhases = ['preEvent', 'setup', 'live', 'post']

export const registrationFieldLibrary = [
  { id: 'name', label: 'Full Name', type: 'text', required: true },
  { id: 'email', label: 'Email', type: 'email', required: false },
  { id: 'phone', label: 'Mobile Number', type: 'tel', required: false },
  { id: 'company', label: 'Company / Family Group', type: 'text', required: false },
  { id: 'dietary', label: 'Dietary Notes', type: 'text', required: false },
]

export const defaultPaymentGateways = [
  { id: 'gcash', label: 'GCash', enabled: true },
  { id: 'maya', label: 'Maya', enabled: true },
  { id: 'card', label: 'Card', enabled: false },
  { id: 'cash', label: 'Cash', enabled: true },
]

export const manageEventCreatePayloadFields = ['title', 'date', 'city', 'venue', 'guestCapacity']

export const manageEventCreateDefaults = {
  status: 'draft',
  seatsPerTable: 10,
}
