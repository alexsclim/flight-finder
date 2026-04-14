import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiClient } from '../api';
import { format } from 'date-fns';

export function AlertDetailPage() {
  const { alertId } = useParams();
  const [alert, setAlert] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (alertId) {
      fetchAlert();
    }
  }, [alertId]);

  const fetchAlert = async () => {
    try {
      const response = await apiClient.getAlert(alertId!);
      setAlert(response.data);
    } catch (err: any) {
      setError('Failed to load alert');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  if (error || !alert) {
    return <div className="p-6 text-center text-red-600">{error || 'Alert not found'}</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        {alert.departureAirport} → {alert.arrivalAirport}
      </h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-lg font-semibold mb-4">Alert Details</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Period:</span>
            <p>{format(new Date(alert.startDate), 'MMM dd')} - {format(new Date(alert.endDate), 'MMM dd, yyyy')}</p>
          </div>
          <div>
            <span className="text-gray-600">Airlines:</span>
            <p>{alert.airlines.join(', ')}</p>
          </div>
          <div>
            <span className="text-gray-600">Cabins:</span>
            <p>{alert.cabinClasses.join(', ')}</p>
          </div>
          <div>
            <span className="text-gray-600">Max Miles:</span>
            <p>{alert.maxMilesCost || 'No limit'}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Recent Matches ({alert.matches?.length || 0})</h2>
        
        {alert.matches && alert.matches.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Airline</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Cabin</th>
                <th className="px-4 py-2 text-left">Miles</th>
                <th className="px-4 py-2 text-left">Found</th>
              </tr>
            </thead>
            <tbody>
              {alert.matches.map((match: any) => (
                <tr key={match.id} className="border-t">
                  <td className="px-4 py-2">{match.airline}</td>
                  <td className="px-4 py-2">{format(new Date(match.departureDate), 'MMM dd')}</td>
                  <td className="px-4 py-2">{match.cabinClass}</td>
                  <td className="px-4 py-2 font-semibold">{match.milesCost}k</td>
                  <td className="px-4 py-2 text-gray-500 text-xs">{format(new Date(match.createdAt), 'HH:mm')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500">No matches yet. Check back soon!</p>
        )}
      </div>

      <div className="mt-6">
        <a href="/alerts" className="text-blue-600 hover:underline">
          ← Back to Alerts
        </a>
      </div>
    </div>
  );
}
