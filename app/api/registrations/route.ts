import { NextResponse } from 'next/server'
import { registerForEvent, cancelRegistration, getRegistrationsForStudent } from '@/data/registrations'

// GET: Fetch fresh registrations from the server's memory
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const studentId = searchParams.get('studentId')
  
  if (!studentId) {
    return NextResponse.json({ error: 'Student ID required' }, { status: 400 })
  }

  const regs = getRegistrationsForStudent(studentId)
  return NextResponse.json({ registrations: regs })
}

// POST: Register for an event (Task 2)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { eventId, studentId } = body
    const newReg = registerForEvent(eventId, studentId)
    return NextResponse.json({ success: true, registration: newReg }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

// DELETE: Cancel a registration (Task 3)
export async function DELETE(request: Request) {
  try {
    const body = await request.json()
    const { registrationId, studentId } = body
    const cancelledReg = cancelRegistration(registrationId, studentId)
    return NextResponse.json({ success: true, registration: cancelledReg }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}