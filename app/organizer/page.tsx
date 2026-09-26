'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import EmptyState from '@/components/EmptyState'
import StatusBadge from '@/components/StatusBadge'

export default function OrganizerPage() {
  const { currentUser } = useAuth()
  
  const [myEvents, setMyEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  // Fetch live events from the server and filter for this organizer
  useEffect(() => {
    if (currentUser.role === 'organizer') {
      fetch('/api/events')
        .then(res => res.json())
        .then(data => {
          if (data.events) {
            setMyEvents(data.events.filter((e: any) => e.organizerId === currentUser.id))
          }
          setLoading(false)
        })
        .catch(err => {
          console.error(err)
          setLoading(false)
        })
    }
  }, [currentUser])

  if (currentUser.role !== 'organizer') {
    return (
      <section className="shell" style={{ padding: '56px 0' }}>
        <EmptyState
          title="This page is for organizers"
          description="Switch to an organizer account from the top-right menu to manage events."
        />
      </section>
    )
  }

  // Handle cancelling an event
  async function handleCancel(eventId: string) {
    if (!confirm('Are you sure you want to cancel this event? This action cannot be undone.')) return
    
    setCancellingId(eventId)
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizerId: currentUser.id }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to cancel')
      }

      // Instantly update UI to show as cancelled
      setMyEvents(prev => prev.map(e => e.id === eventId ? { ...e, cancelled: true } : e))
    } catch (error: any) {
      alert(error.message)
    } finally {
      setCancellingId(null)
    }
  }

  return (
    <section className="shell" style={{ padding: '40px 0 64px' }}>
      <div
        style={{
          marginBottom: 28,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <span className="eyebrow-tag">organizer console</span>
          <h1 style={{ fontSize: 30, marginTop: 10 }}>Manage your events</h1>
          <p style={{ marginTop: 8 }}>Create, edit, and cancel your events.</p>
        </div>
        {/* Route to the creation form we will build next */}
        <Link href="/organizer/events/new" className="btn btn-primary">
          + New event
        </Link>
      </div>

      {loading ? (
        <p>Loading your events...</p>
      ) : myEvents.length === 0 ? (
        <EmptyState
          title="No events posted yet"
          description="Once you create an event, it'll show up here."
        />
      ) : (
        <ul style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {myEvents.map((event) => {
            const status = event.cancelled ? 'cancelled' : event.seatsAvailable <= 0 ? 'full' : 'open'
            const isCancelled = event.cancelled

            return (
              <li
                key={event.id}
                className="card-surface"
                style={{
                  padding: '18px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                  flexWrap: 'wrap',
                  opacity: isCancelled ? 0.6 : 1, // Fade out cancelled events
                }}
              >
                <div>
                  <Link
                    href={`/events/${event.id}`}
                    style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 17, textDecoration: 'none' }}
                  >
                    {event.name}
                  </Link>
                  <div style={{ fontSize: 13.5, color: 'var(--ink-soft)', marginTop: 4 }}>
                    {new Date(event.date).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })} · {event.venue} · {event.seatsAvailable}/{event.capacity} seats
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <StatusBadge status={status} />
                  
                  {!isCancelled && (
                    <>
                      {/* Route to the edit form we will build next */}
                      <Link href={`/organizer/events/${event.id}/edit`} className="btn btn-secondary">
                        Edit
                      </Link>
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleCancel(event.id)}
                        disabled={cancellingId === event.id}
                      >
                        {cancellingId === event.id ? 'Cancelling...' : 'Cancel'}
                      </button>
                    </>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}