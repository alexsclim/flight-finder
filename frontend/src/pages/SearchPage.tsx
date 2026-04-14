import React, { useState } from 'react';
import { apiClient } from '../api';
import { format } from 'date-fns';

export function SearchPage() {
  const [formData, setFormData] = useState({
    departureAirport: '',
    arrivalAirport: '',
    startDate: '',
    endDate: '',
    cabinClasses: ['Economy', 'Business'],
    airlines: ['United', 'Alaska'],
    maxMilesCost: '',
  });

  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      const currentArray = formData[name as keyof typeof formData] as string[];
      if (checked) {
        setFormData(prev => ({
          ...prev,
          [name]: [...currentArray, value],
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: currentArray.filter(item => item !== value),
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiClient.search({
        ...formData,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        maxMilesCost: formData.maxMilesCost ? parseInt(formData.maxMilesCost) : undefined,
      });

      setResults(response.data.results);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">✈️ Award Seat Search</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <form onSubmit={handleSearch}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">From</label>
              <input
                type="text"
                name="departureAirport"
                placeholder="e.g., JFK"
                value={formData.departureAirport}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md uppercase"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">To</label>
              <input
                type="text"
                name="arrivalAirport"
                placeholder="e.g., LHR"
                value={formData.arrivalAirport}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md uppercase"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Depart</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Return</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Max Miles</label>
            <input
              type="number"
              name="maxMilesCost"
              placeholder="Leave empty for no limit"
              value={formData.maxMilesCost}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Searching...' : 'Search Awards'}
          </button>
        </form>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Airline</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Cabin</th>
                <th className="px-4 py-2 text-left">Miles</th>
                <th className="px-4 py-2 text-left">Seats</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-4 py-2">{result.airline}</td>
                  <td className="px-4 py-2">
                    {format(new Date(result.departureDate), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-4 py-2">{result.cabinClass}</td>
                  <td className="px-4 py-2 font-semibold">{result.milesCost}k</td>
                  <td className="px-4 py-2">
                    {result.availableSeats > 0 ? '✅ Available' : '❌ Not available'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {results.length === 0 && !loading && (
        <div className="text-center text-gray-500 py-8">
          No searches performed yet
        </div>
      )}
    </div>
  );
}
