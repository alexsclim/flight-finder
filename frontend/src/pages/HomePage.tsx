import React from 'react';
import { useAuthStore } from '../store';

export function HomePage() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            ✈️ Award Seat Alerts
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Get notified when award flights appear to your favorite destinations
          </p>

          {!isAuthenticated ? (
            <div className="flex gap-4 justify-center">
              <a
                href="/search"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
              >
                Search Awards
              </a>
              <a
                href="/login"
                className="bg-white text-blue-600 px-6 py-3 rounded-lg border-2 border-blue-600 hover:bg-blue-50 font-semibold"
              >
                Login to Get Alerts
              </a>
            </div>
          ) : (
            <div className="flex gap-4 justify-center">
              <a
                href="/search"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
              >
                Search Awards
              </a>
              <a
                href="/alerts"
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 font-semibold"
              >
                My Alerts
              </a>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">🔍 Search</h3>
            <p className="text-gray-600">
              Search across multiple airlines and transfer partners instantly
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">🔔 Monitor</h3>
            <p className="text-gray-600">
              Set up alerts for your favorite routes and get notified via SMS
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">🌍 Global</h3>
            <p className="text-gray-600">
              Search flights to anywhere in the world with any frequent flyer program
            </p>
          </div>
        </div>

        {isAuthenticated && (
          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">
              Welcome back, {user?.email}!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
