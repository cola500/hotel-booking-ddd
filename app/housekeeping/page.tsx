'use client';

import { useState, useEffect } from 'react';

interface CleaningTask {
  id: string;
  bookingId: string;
  roomNumber: string;
  status: string;
}

export default function HousekeepingPage() {
  const [tasks, setTasks] = useState<CleaningTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/housekeeping/tasks');
      const data = await response.json();
      setTasks(data.tasks);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    // Poll every 3 seconds to show new tasks automatically
    const interval = setInterval(fetchTasks, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (id: string, action: 'start' | 'complete') => {
    try {
      const response = await fetch(`/api/housekeeping/tasks/${id}/${action}`, {
        method: 'POST'
      });

      if (response.ok) {
        fetchTasks();
      } else {
        const data = await response.json();
        alert(`Fel: ${data.error}`);
      }
    } catch (error) {
      alert('Kunde inte uppdatera städuppgift');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'InProgress':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'Väntar';
      case 'InProgress':
        return 'Pågår';
      case 'Completed':
        return 'Klar';
      default:
        return status;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">🧹 Städuppgifter</h2>
        <p className="text-sm text-gray-600 mt-1">
          Dessa skapas automatiskt vid checkout (event-driven!)
        </p>
      </div>

      {isLoading ? (
        <div className="p-6 text-center text-gray-500">Laddar...</div>
      ) : tasks.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          Inga städuppgifter ännu. Checka ut en bokning först!
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Åtgärder
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {task.roomNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono text-xs">
                    {task.bookingId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                        task.status
                      )}`}
                    >
                      {getStatusText(task.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {task.status === 'Pending' && (
                      <button
                        onClick={() => handleAction(task.id, 'start')}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                      >
                        Starta städning
                      </button>
                    )}
                    {task.status === 'InProgress' && (
                      <button
                        onClick={() => handleAction(task.id, 'complete')}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                      >
                        Markera klar
                      </button>
                    )}
                    {task.status === 'Completed' && (
                      <span className="text-gray-500">✓ Slutförd</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
