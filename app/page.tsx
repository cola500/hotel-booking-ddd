'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface DomainEvent {
  eventId: string;
  eventType: string;
  occurredAt: string;
  aggregateId: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    bookings: 0,
    tokens: 0,
    tasks: 0
  });
  const [events, setEvents] = useState<DomainEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsRes, tokensRes, tasksRes, eventsRes] = await Promise.all([
          fetch('/api/bookings'),
          fetch('/api/access/tokens'),
          fetch('/api/housekeeping/tasks'),
          fetch('/api/events')
        ]);

        const bookings = await bookingsRes.json();
        const tokens = await tokensRes.json();
        const tasks = await tasksRes.json();
        const eventsData = await eventsRes.json();

        setStats({
          bookings: bookings.bookings.length,
          tokens: tokens.tokens.length,
          tasks: tasks.tasks.length
        });
        setEvents(eventsData.events.slice(-10).reverse());
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    // Poll every 2 seconds for real-time updates
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Event-driven DDD-arkitektur i action - se hur events kopplar samman bounded contexts!
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/bookings"
          className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg shadow hover:shadow-lg transition-shadow border border-blue-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 uppercase tracking-wide">
                📅 Bookings
              </p>
              <p className="text-4xl font-bold text-blue-900 mt-2">{stats.bookings}</p>
            </div>
          </div>
          <p className="text-xs text-blue-600 mt-4">→ Klicka för att hantera bokningar</p>
        </Link>

        <Link
          href="/access"
          className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg shadow hover:shadow-lg transition-shadow border border-green-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 uppercase tracking-wide">
                🔑 Access Tokens
              </p>
              <p className="text-4xl font-bold text-green-900 mt-2">{stats.tokens}</p>
            </div>
          </div>
          <p className="text-xs text-green-600 mt-4">→ Klicka för door unlock simulator</p>
        </Link>

        <Link
          href="/housekeeping"
          className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg shadow hover:shadow-lg transition-shadow border border-purple-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 uppercase tracking-wide">
                🧹 Cleaning Tasks
              </p>
              <p className="text-4xl font-bold text-purple-900 mt-2">{stats.tasks}</p>
            </div>
          </div>
          <p className="text-xs text-purple-600 mt-4">→ Klicka för task management</p>
        </Link>
      </div>

      {/* Event Stream */}
      <div className="bg-gray-900 text-green-400 p-6 rounded-lg shadow-lg font-mono text-sm">
        <h2 className="text-lg font-bold mb-4 text-green-300">
          📡 Event Stream (Live)
        </h2>
        <p className="text-xs text-green-500 mb-4">
          Domain events som flödar genom systemet. Detta är kärnan i event-driven arkitektur!
        </p>

        {isLoading ? (
          <div className="text-center py-4 text-green-500">Laddar events...</div>
        ) : events.length === 0 ? (
          <div className="text-center py-4 text-green-500">
            Inga events än. Skapa en bokning för att se events flöda!
          </div>
        ) : (
          <div className="space-y-1 max-h-96 overflow-y-auto">
            {events.map((e) => (
              <div key={e.eventId} className="flex items-start space-x-2 py-1">
                <span className="text-green-600 flex-shrink-0">
                  [{new Date(e.occurredAt).toLocaleTimeString('sv-SE')}]
                </span>
                <span className="text-yellow-400 font-semibold flex-shrink-0">
                  {e.eventType}
                </span>
                <span className="text-gray-500">→</span>
                <span className="text-blue-400 font-mono text-xs">
                  {e.aggregateId.substring(0, 12)}...
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-700 text-xs text-gray-500">
          <p>💡 Tips: Skapa en bokning → Se BookingConfirmed → Access token skapas automatiskt!</p>
          <p className="mt-1">💡 Checka ut → Se BookingCheckedOut → Städuppgift skapas automatiskt!</p>
        </div>
      </div>

      {/* Architecture Explanation */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-3">
          🏗️ DDD-arkitektur Översikt
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-4 bg-blue-50 rounded border border-blue-200">
            <p className="font-semibold text-blue-900 mb-2">Booking Context</p>
            <p className="text-blue-700 text-xs">
              Hanterar bokningar och rum. Emittar BookingConfirmed och BookingCheckedOut events.
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded border border-green-200">
            <p className="font-semibold text-green-900 mb-2">Access Context</p>
            <p className="text-green-700 text-xs">
              Lyssnar på BookingConfirmed → Genererar access tokens automatiskt.
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded border border-purple-200">
            <p className="font-semibold text-purple-900 mb-2">Housekeeping Context</p>
            <p className="text-purple-700 text-xs">
              Lyssnar på BookingCheckedOut → Skapar städuppgifter automatiskt.
            </p>
          </div>
        </div>
        <p className="text-xs text-gray-600 mt-4">
          ⚡ Contexts kommunicerar ENDAST via domain events - ingen direkt koppling!
        </p>
      </div>
    </div>
  );
}
