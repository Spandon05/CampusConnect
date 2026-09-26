import { getEventById, isPastEvent, isFullEvent } from './events'

export type RegistrationStatus = 'confirmed' | 'cancelled'

export interface Registration {
  id: string
  eventId: string
  studentId: string
  status: RegistrationStatus
  registeredAt: string 
}

export const registrations: Registration[] = [
  {
    id: 'reg-01',
    eventId: 'evt-01',
    studentId: 'stu-1',
    status: 'confirmed',
    registeredAt: '2026-09-10T10:15:00',
  },
  {
    id: 'reg-02',
    eventId: 'evt-04',
    studentId: 'stu-1',
    status: 'confirmed',
    registeredAt: '2026-08-20T09:00:00',
  },
  {
    id: 'reg-03',
    eventId: 'evt-09',
    studentId: 'stu-1',
    status: 'confirmed',
    registeredAt: '2026-09-12T18:40:00',
  },
]

export function getRegistrationsForStudent(studentId: string) {
  return registrations.filter(reg => {
    // 1. Must belong to the student
    if (reg.studentId !== studentId) return false;
    
    // 2. Hide registrations if the organizer cancelled the underlying event
    const event = getEventById(reg.eventId);
    if (!event || event.cancelled) return false;
    
    // 3. Exclude registrations that the student has already cancelled
    if (reg.status === 'cancelled') return false; 

    return true;
  });
}

export function registerForEvent(eventId: string, studentId: string): Registration {
  const event = getEventById(eventId);
  
  if (!event) throw new Error('Event not found.');
  if (event.cancelled) throw new Error('Cannot register for a cancelled event.');
  if (isPastEvent(event)) throw new Error('Cannot register for a past event.');

  // Check if seat count is 0 or less
  if (event.seatsAvailable <= 0) {
    throw new Error('This event is completely full.');
  }

  // Prevent duplicate registrations
  const alreadyRegistered = registrations.find(
    (r) => r.eventId === eventId && r.studentId === studentId && r.status === 'confirmed'
  );
  
  if (alreadyRegistered) {
    throw new Error('You are already registered for this event.');
  }

  // Mathematically decrement the seat count
  event.seatsAvailable -= 1;

  const newRegistration: Registration = {
    id: `reg-${Date.now()}`,
    eventId,
    studentId,
    status: 'confirmed',
    registeredAt: new Date().toISOString()
  };
  
  registrations.push(newRegistration);
  return newRegistration;
}

export function cancelRegistration(registrationId: string, studentId: string): Registration {
  const registration = registrations.find((reg) => reg.id === registrationId);
  
  if (!registration) {
    throw new Error('Registration not found.');
  }

  if (registration.studentId !== studentId) {
    throw new Error('You can only cancel your own registrations.');
  }

  if (registration.status === 'cancelled') {
    throw new Error('This registration is already cancelled.');
  }

  const event = getEventById(registration.eventId);
  
  if (!event) {
    throw new Error('Event not found.');
  }

  if (isPastEvent(event)) {
    throw new Error('You cannot cancel a registration for a past event.');
  }

  // Cancel the registration and increase the available seats
  registration.status = 'cancelled';
  event.seatsAvailable += 1;

  return registration;
}