'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { getEventById, isPastEvent } from '@/data/events'
import StatusBadge from '@/components/StatusBadge'
import EmptyState from '@/components/EmptyState'

export default function RegistrationsPage() {
  const { currentUser } = useAuth()
  
  const [regs, setRegs] = useState<any[]>([])
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch the fresh list from the server when the page loads!
  useEffect(() => {
    if (currentUser.role === 'student') {
      fetch(`/api/registrations?studentId=${currentUser.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.registrations) {
            setRegs(data.registrations)
          }
          setLoading(false)
        })
        .catch(err => {
          console.error(err)
          setLoading(false)
        })
    }
  }, [currentUser])

  if (currentUser.role !== 'student') {
    return (
      <section className="shell" style={{ padding: '56px 0' }}>
        <EmptyState
          title="This page is for students"
          description="Switch to a student account from the top-right menu to see registered events."
        />
      </section>
    )
  }

  async function handleCancel(registrationId: string) {
    setCancellingId(registrationId)
    try {
      const response = await fetch('/api/registrations', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId, studentId: currentUser.id }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to cancel')
      }

      setRegs((prev) => 
        prev.map(r => r.id === registrationId ? { ...r, status: 'cancelled' } : r)
      )
    } catch (error: any) {
      alert(error.message)
    } finally {
      setCancellingId(null)
    }
  }

  const upcoming: typeof regs = []
  const pastOrCancelled: typeof regs = []

  regs.forEach(reg => {
    const event = getEventById(reg.eventId)
    if (!event) return
    
    if (reg.status === 'cancelled' || isPastEvent(event)) {
      pastOrCancelled.push(reg)
    } else {
      upcoming.push(reg)
    }
  })

  function RegistrationCard({ reg }: { reg: any }) {
    const event = getEventById(reg.eventId)
    if (!event) return null
    
    const isPast = isPastEvent(event)
    const isCancelled = reg.status === 'cancelled'
    const canCancel = !isPast && !isCancelled

    return (
      <li
        className="card-surface"
        style={{
          padding: '18px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
          opacity: isCancelled ? 0.6 : 1,
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
            })}{' '}
            · {event.venue}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <StatusBadge status={isCancelled ? 'cancelled' : isPast ? 'past' : 'open'} />
          
          {canCancel && (
            <button
              className="btn btn-secondary"
              onClick={() => handleCancel(reg.id)}
              disabled={cancellingId === reg.id}
            >
              {cancellingId === reg.id ? 'Cancelling...' : 'Cancel'}
            </button>
          )}
        </div>
      </li>
    )
  }

  return (
    <section className="shell" style={{ padding: '40px 0 64px' }}>
      <div style={{ marginBottom: 28 }}>
        <span className="eyebrow-tag">signed up as {currentUser.name}</span>
        <h1 style={{ fontSize: 30, marginTop: 10 }}>My registrations</h1>
        <p style={{ marginTop: 8 }}>Manage your event sign-ups below.</p>
      </div>

      {loading ? (
        <p>Loading registrations...</p>
      ) : regs.length === 0 ? (
        <EmptyState
          title="No registrations yet"
          description="Once you register for an event, it'll show up here."
          action={<Link href="/events" className="btn btn-primary">Browse events</Link>}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {upcoming.length > 0 && (
            <div>
              <h2 style={{ fontSize: 18, marginBottom: 12 }}>Upcoming Events</h2>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {upcoming.map((reg) => <RegistrationCard key={reg.id} reg={reg} />)}
              </ul>
            </div>
          )}

          {pastOrCancelled.length > 0 && (
            <div>
              <h2 style={{ fontSize: 18, marginBottom: 12 }}>Past & Cancelled</h2>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {pastOrCancelled.map((reg) => <RegistrationCard key={reg.id} reg={reg} />)}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  )
}