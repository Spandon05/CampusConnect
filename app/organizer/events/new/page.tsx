'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import EmptyState from '@/components/EmptyState'

export default function NewEventPage() {
  const router = useRouter()
  const { currentUser } = useAuth()

  // State to hold all form inputs
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    venue: '',
    category: 'Tech',
    capacity: ''
  })
  
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Security check: Only organizers can see this page
  if (currentUser.role !== 'organizer') {
    return (
      <section className="shell" style={{ padding: '56px 0' }}>
        <EmptyState title="Access Denied" description="Only organizers can create events." />
      </section>
    )
  }

  // Handle the form submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, organizerId: currentUser.id }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create event')
      }

      // If successful, send the user back to their dashboard!
      router.push('/organizer')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="shell" style={{ padding: '40px 0 64px', maxWidth: 600 }}>
      <Link href="/organizer" style={{ fontSize: 13.5, fontWeight: 600, textDecoration: 'none' }}>
        ← Back to Dashboard
      </Link>

      <h1 style={{ fontSize: 30, marginTop: 20, marginBottom: 24 }}>Create a New Event</h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {error && (
          <div style={{ padding: '10px 14px', borderRadius: 6, backgroundColor: '#fce8e6', color: '#c5221f', fontSize: 14 }}>
            {error}
          </div>
        )}
        
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14, fontWeight: 500 }}>
          Event Name
          <input 
            required 
            type="text" 
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})} 
            style={{ padding: '10px', border: '1.5px solid var(--line)', borderRadius: 'var(--radius)' }} 
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14, fontWeight: 500 }}>
          Date & Time (Must be in the future)
          <input 
            required 
            type="datetime-local" 
            value={formData.date} 
            onChange={e => setFormData({...formData, date: e.target.value})} 
            style={{ padding: '10px', border: '1.5px solid var(--line)', borderRadius: 'var(--radius)' }} 
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14, fontWeight: 500 }}>
          Venue
          <input 
            required 
            type="text" 
            value={formData.venue} 
            onChange={e => setFormData({...formData, venue: e.target.value})} 
            style={{ padding: '10px', border: '1.5px solid var(--line)', borderRadius: 'var(--radius)' }} 
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14, fontWeight: 500 }}>
          Total Capacity (Number of seats)
          <input 
            required 
            type="number" 
            min="1" 
            value={formData.capacity} 
            onChange={e => setFormData({...formData, capacity: e.target.value})} 
            style={{ padding: '10px', border: '1.5px solid var(--line)', borderRadius: 'var(--radius)' }} 
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14, fontWeight: 500 }}>
          Category
          <select 
            value={formData.category} 
            onChange={e => setFormData({...formData, category: e.target.value})} 
            style={{ padding: '10px', border: '1.5px solid var(--line)', borderRadius: 'var(--radius)', background: 'var(--paper)' }}
          >
            <option>Tech</option>
            <option>Cultural</option>
            <option>Sports</option>
            <option>Workshop</option>
            <option>Career</option>
            <option>Music</option>
          </select>
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14, fontWeight: 500 }}>
          Description
          <textarea 
            required 
            rows={4} 
            value={formData.description} 
            onChange={e => setFormData({...formData, description: e.target.value})} 
            style={{ padding: '10px', border: '1.5px solid var(--line)', borderRadius: 'var(--radius)', fontFamily: 'inherit' }} 
          />
        </label>

        <button type="submit" disabled={loading} className="btn btn-primary" style={{ marginTop: 8 }}>
          {loading ? 'Creating Event...' : 'Create Event'}
        </button>
      </form>
    </section>
  )
}