import { NextResponse } from 'next/server'
import { events, createEvent } from '@/data/events'

// GET: Fetch all live events
export async function GET() {
  return NextResponse.json({ events })
}

// POST: Create a new event (Task 4)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { organizerId, ...eventData } = body
    
    // Create the event. If no organizerId is provided, fallback to the mock 'org-1'
    const newEvent = createEvent(eventData, organizerId || 'org-1')
    
    return NextResponse.json({ success: true, event: newEvent }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}