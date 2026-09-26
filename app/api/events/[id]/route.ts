import { NextResponse } from 'next/server'
import { updateEvent, cancelEvent } from '@/data/events'

// PUT: Edit an existing event (Task 4)
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { organizerId, ...updateData } = body
    
    const updatedEvent = updateEvent(params.id, updateData, organizerId || 'org-1')
    return NextResponse.json({ success: true, event: updatedEvent }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

// DELETE: Cancel an event (Task 4)
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { organizerId } = body
    
    const cancelledEvent = cancelEvent(params.id, organizerId || 'org-1')
    return NextResponse.json({ success: true, event: cancelledEvent }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}