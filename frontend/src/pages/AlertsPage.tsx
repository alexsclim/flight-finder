import React, { useEffect, useState } from 'react';
import { apiClient } from '../api';
import { useAuthStore } from '../store';
import { format } from 'date-fns';

export function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());

  useEffect(() => {
    if (isAuthenticated) {
      fetchAlerts();
    }
  }, [isAuthenticated]);

  const fetchAlerts = async () => {
    try {
      const response = await apiClient.getAlerts();
      setAlerts(response.data);
    } catch (err: any) {
      setError('Failed to load alerts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (alertId: string) => {
    if (!confirm('Delete this alert?')) return;
    
    try {
      await apiClient.deleteAlert(alertId);
      setAlerts(alerts.filter(a => a.id !== alertId));
    } catch (err) {
      setError('Failed to delete alert');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-6 text-center">
        <p>Please <a href="/login" className="text-blue-600 hover:underline">login</a> to manage alerts</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🔔 My Alerts</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Loading alerts...</div>
      ) : alerts.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500">
          <p className="mb-4">No alerts yet</p>
          <a href="/search" className="text-blue-600 hover:underline">
            Create your first alert
          </a>
        </div>
      ) : (
        <div className="grid gap-4">
          {alerts.map(alert => (
            <div key={alert.id} className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">
                  {alert.departureAirport} → {alert.arrivalAirport}
                </h3>
                <button
                  onClick={() => handleDelete(alert.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Delete
                </button>
              </div>
              
              <div className="text-sm text-gray-600 mb-3">
                <p>📅 {format(new Date(alert.startDate), 'MMM dd')} - {format(new Date(alert.endDate), 'MMM dd, yyyy')}</p>
                <p>✈️ Airlines: {alert.airlines.join(', ')}</p>
                <p>💺 Cabins: {alert.cabinClasses.join(', ')}</p>
                {alert.maxMilesCost && <p>💰 Max: {alert.maxMilesCost}k miles</p>}
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {alert._count?.matches || 0} matches found
                </span>
                <a href={`/alerts/${alert.id}`} className="text-blue-600 hover:underline text-sm">
                  View Details
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6">
        <a href="/search" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          + New Alert
        </a>
      </div>
    </div>
  );
}
