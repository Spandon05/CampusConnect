'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import StatusBadge from '@/components/StatusBadge'
import EmptyState from '@/components/EmptyState'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-IN', {
    hour: 'numeric', minute: '2-digit',
  })
}

export default function EventDetailPage({ params }: { params: { id: string } }) {
  // Bring in the real authenticated user!
  const { currentUser } = useAuth()
  
  const [event, setEvent] = useState<any>(null)
  const [loadingPage, setLoadingPage] = useState(true)
  
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [localSeats, setLocalSeats] = useState(0)

  // Fetch the live event from the server
  useEffect(() => {
    fetch('/api/events')
      .then(res => res.json())
      .then(data => {
        if (data.events) {
          const found = data.events.find((e: any) => e.id === params.id)
          if (found) {
            setEvent(found)
            setLocalSeats(found.seatsAvailable)
          }
        }
        setLoadingPage(false)
      })
      .catch(() => setLoadingPage(false))
  }, [params.id])

  if (loadingPage) {
    return <section className="shell" style={{ padding: '56px 0' }}><p>Loading event details...</p></section>
  }

  if (!event) {
    return (
      <section className="shell" style={{ padding: '56px 0' }}>
        <EmptyState
          title="This event isn't on the board"
          description="It may have been removed, or the link might be wrong. Head back to the full listing to find what you're looking for."
          action={
            <Link href="/events" className="btn btn-primary">
              Back to events
            </Link>
          }
        />
      </section>
    )
  }

  const past = new Date(event.date) < new Date()
  const full = localSeats <= 0
  const status = event.cancelled ? 'cancelled' : past ? 'past' : full ? 'full' : 'open'
  const canRegister = !past && !full && !event.cancelled

  async function handleRegister() {
    // Make sure they are logged in as a student!
    if (currentUser.role !== 'student') {
      setMessage({ type: 'error', text: 'You must be logged in as a student to register.' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Use the real dynamically logged-in student's ID!
        body: JSON.stringify({ eventId: event.id, studentId: currentUser.id }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      setMessage({ type: 'success', text: 'Successfully registered!' })
      setLocalSeats((prev) => prev - 1)
      
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="shell" style={{ padding: '40px 0 64px' }}>
      <Link href="/events" style={{ fontSize: 13.5, fontWeight: 600, textDecoration: 'none' }}>
        ← All events
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 32, marginTop: 20 }} className="hero-grid">
        <div>
          <span className="eyebrow-tag">{event.category}</span>
          <h1 style={{ fontSize: 32, marginTop: 12 }}>{event.name}</h1>
          <p style={{ marginTop: 16, fontSize: 15.5 }}>{event.description}</p>
        </div>

        <aside className="card-surface" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14, height: 'fit-content' }}>
          <StatusBadge status={status} />
          <Detail label="Date" value={formatDate(event.date)} />
          <Detail label="Time" value={formatTime(event.date)} />
          <Detail label="Venue" value={event.venue} />
          <Detail label="Seats" value={`${localSeats} of ${event.capacity} available`} />

          <button
            className="btn btn-primary"
            disabled={!canRegister || loading}
            onClick={handleRegister}
            style={{ marginTop: 4 }}
          >
            {loading ? 'Registering...' : canRegister ? 'Register' : status === 'full' ? 'Event full' : 'Registration closed'}
          </button>

          {message && (
            <div style={{ 
              marginTop: 12, 
              padding: '10px 14px', 
              borderRadius: 6, 
              fontSize: 14,
              backgroundColor: message.type === 'success' ? '#e6f4ea' : '#fce8e6',
              color: message.type === 'success' ? '#137333' : '#c5221f'
            }}>
              {message.text}
            </div>
          )}
        </aside>
      </div>
    </section>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{label}</div>
      <div style={{ fontSize: 14.5, fontWeight: 500 }}>{value}</div>
    </div>
  )
}