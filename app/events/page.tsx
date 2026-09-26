'use client'

import { useState, useEffect } from 'react'
import { 
  EventCategory, 
  searchEventsByName, 
  filterEventsByCategory,
  isPastEvent 
} from '@/data/events'
import EventCard from '@/components/EventCard'

const CATEGORIES: (EventCategory | 'All')[] = [
  'All',
  'Tech',
  'Cultural',
  'Sports',
  'Workshop',
  'Career',
  'Music',
]

export default function EventsPage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<EventCategory | 'All'>('All')
  const [liveEvents, setLiveEvents] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/events')
      .then(res => res.json())
      .then(data => {
        if (data.events) {
          setLiveEvents(data.events)
        }
      })
      .catch(err => console.error('Failed to load live events:', err))
  }, [])

  // BUG 3 FIX: Filter out past events AND cancelled events
  const upcomingEvents = liveEvents.filter((event) => !isPastEvent(event) && !event.cancelled);

  const categoryFiltered = filterEventsByCategory(upcomingEvents, category);
  const displayedEvents = searchEventsByName(categoryFiltered, query);

  return (
    <section className="shell" style={{ padding: '40px 0 64px' }}>
      <div style={{ marginBottom: 28 }}>
        <span className="eyebrow-tag">the board</span>
        <h1 style={{ fontSize: 30, marginTop: 10 }}>All events</h1>
        <p style={{ marginTop: 8 }}>
          Everything posted by clubs and departments this semester.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
        <input
          type="search"
          placeholder="Search events by name…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            flex: '1 1 240px',
            padding: '10px 14px',
            border: '1.5px solid var(--line)',
            borderRadius: 'var(--radius)',
            fontSize: 14.5,
            background: 'var(--paper-raised)',
          }}
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as EventCategory | 'All')}
          style={{
            padding: '10px 14px',
            border: '1.5px solid var(--line)',
            borderRadius: 'var(--radius)',
            fontSize: 14.5,
            background: 'var(--paper-raised)',
          }}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c === 'All' ? 'All categories' : c}
            </option>
          ))}
        </select>
      </div>

      {displayedEvents.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 16,
          }}
        >
          {displayedEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div style={{ padding: '40px 0', textAlign: 'center' }}>
          <p>{liveEvents.length === 0 ? 'Loading events...' : 'No upcoming events match your search.'}</p>
        </div>
      )}
    </section>
  )
}