export type ReservationStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed'
export type TableStatus = 'available' | 'occupied' | 'reserved'

export interface Reservation {
  id: string
  customerName: string
  email: string
  date: string
  timeSlot: string
  tableNumber: number
  guests: number
  status: ReservationStatus
}

export interface Table {
  id: string
  tableNumber: number
  capacity: number
  status: TableStatus
}

export const TIME_SLOTS = [
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '1:00 PM',  '1:30 PM',  '2:00 PM',  '2:30 PM',
  '5:00 PM',  '5:30 PM',  '6:00 PM',  '6:30 PM',
  '7:00 PM',  '7:30 PM',  '8:00 PM',  '8:30 PM',
  '9:00 PM',
]

export const MOCK_RESERVATIONS: Reservation[] = [
  {
    id: 'r1',
    customerName: 'Sophia Andersen',
    email: 'sophia@example.com',
    date: '2026-07-10',
    timeSlot: '7:00 PM',
    tableNumber: 4,
    guests: 2,
    status: 'confirmed',
  },
  {
    id: 'r2',
    customerName: 'Marcus Williams',
    email: 'marcus@example.com',
    date: '2026-07-11',
    timeSlot: '8:00 PM',
    tableNumber: 7,
    guests: 4,
    status: 'pending',
  },
  {
    id: 'r3',
    customerName: 'Elena Rossi',
    email: 'elena@example.com',
    date: '2026-07-08',
    timeSlot: '6:30 PM',
    tableNumber: 2,
    guests: 3,
    status: 'completed',
  },
  {
    id: 'r4',
    customerName: 'James Park',
    email: 'james@example.com',
    date: '2026-07-06',
    timeSlot: '12:00 PM',
    tableNumber: 1,
    guests: 1,
    status: 'cancelled',
  },
  {
    id: 'r5',
    customerName: 'Amara Osei',
    email: 'amara@example.com',
    date: '2026-07-12',
    timeSlot: '5:30 PM',
    tableNumber: 5,
    guests: 6,
    status: 'confirmed',
  },
  {
    id: 'r6',
    customerName: 'Liam Nakamura',
    email: 'liam@example.com',
    date: '2026-07-13',
    timeSlot: '9:00 PM',
    tableNumber: 8,
    guests: 2,
    status: 'confirmed',
  },
]

export const MOCK_MY_RESERVATIONS: Reservation[] = [
  {
    id: 'my1',
    customerName: 'Alex Johnson',
    email: 'alex@example.com',
    date: '2026-07-10',
    timeSlot: '7:00 PM',
    tableNumber: 4,
    guests: 2,
    status: 'confirmed',
  },
  {
    id: 'my2',
    customerName: 'Alex Johnson',
    email: 'alex@example.com',
    date: '2026-07-15',
    timeSlot: '8:30 PM',
    tableNumber: 9,
    guests: 4,
    status: 'pending',
  },
  {
    id: 'my3',
    customerName: 'Alex Johnson',
    email: 'alex@example.com',
    date: '2026-06-20',
    timeSlot: '6:00 PM',
    tableNumber: 3,
    guests: 2,
    status: 'cancelled',
  },
]

export const MOCK_TABLES: Table[] = [
  { id: 't1', tableNumber: 1, capacity: 2, status: 'available' },
  { id: 't2', tableNumber: 2, capacity: 2, status: 'occupied' },
  { id: 't3', tableNumber: 3, capacity: 4, status: 'reserved' },
  { id: 't4', tableNumber: 4, capacity: 4, status: 'available' },
  { id: 't5', tableNumber: 5, capacity: 6, status: 'available' },
  { id: 't6', tableNumber: 6, capacity: 6, status: 'occupied' },
  { id: 't7', tableNumber: 7, capacity: 8, status: 'reserved' },
  { id: 't8', tableNumber: 8, capacity: 8, status: 'available' },
  { id: 't9', tableNumber: 9, capacity: 2, status: 'available' },
  { id: 't10', tableNumber: 10, capacity: 4, status: 'occupied' },
  { id: 't11', tableNumber: 11, capacity: 4, status: 'available' },
  { id: 't12', tableNumber: 12, capacity: 10, status: 'available' },
]
