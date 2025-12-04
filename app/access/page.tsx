'use client';

import { useState, useEffect } from 'react';

interface AccessToken {
  id: string;
  bookingId: string;
  roomNumber: string;
  code: string;
  validFrom: string;
  validUntil: string;
}

export default function AccessPage() {
  const [tokens, setTokens] = useState<AccessToken[]>([]);
  const [unlockForm, setUnlockForm] = useState({ roomNumber: '', code: '' });
  const [unlockResult, setUnlockResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnlocking, setIsUnlocking] = useState(false);

  const fetchTokens = async () => {
    try {
      const response = await fetch('/api/access/tokens');
      const data = await response.json();
      setTokens(data.tokens);
    } catch (error) {
      console.error('Failed to fetch tokens:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
    // Poll every 3 seconds to show new tokens automatically
    const interval = setInterval(fetchTokens, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setUnlockResult(null);
    setIsUnlocking(true);

    try {
      const response = await fetch('/api/access/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(unlockForm)
      });

      const data = await response.json();
      setUnlockResult(data);
    } catch (error) {
      setUnlockResult({
        success: false,
        message: 'Kunde inte ansluta till servern'
      });
    } finally {
      setIsUnlocking(false);
    }
  };

  const isTokenValid = (validFrom: string, validUntil: string) => {
    const now = new Date();
    const from = new Date(validFrom);
    const until = new Date(validUntil);
    return now >= from && now <= until;
  };

  return (
    <div className="space-y-8">
      {/* Door Unlock Simulator */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4 text-gray-900">
          🔓 Lås upp dörr
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Simulera upplåsning av dörr. Använd rumsnummer och kod från tokenlistan nedan.
        </p>

        <form onSubmit={handleUnlock} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rumsnummer
            </label>
            <input
              type="text"
              placeholder="t.ex. 101"
              value={unlockForm.roomNumber}
              onChange={(e) => setUnlockForm({ ...unlockForm, roomNumber: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Access-kod (6 siffror)
            </label>
            <input
              type="text"
              placeholder="123456"
              value={unlockForm.code}
              onChange={(e) => setUnlockForm({ ...unlockForm, code: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono"
              maxLength={6}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isUnlocking}
            className="w-full bg-green-600 text-white p-3 rounded font-medium hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed transition-colors"
          >
            {isUnlocking ? 'Försöker låsa upp...' : 'Lås upp dörr'}
          </button>
        </form>

        {/* Unlock Result */}
        {unlockResult && (
          <div
            className={`mt-4 p-4 rounded ${
              unlockResult.success
                ? 'bg-green-100 border border-green-400 text-green-800'
                : 'bg-red-100 border border-red-400 text-red-800'
            }`}
          >
            <div className="flex items-center">
              <span className="text-2xl mr-2">
                {unlockResult.success ? '✅' : '❌'}
              </span>
              <span className="font-medium">{unlockResult.message}</span>
            </div>
          </div>
        )}
      </div>

      {/* Access Tokens List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Access Tokens</h2>
          <p className="text-sm text-gray-600 mt-1">
            Dessa genereras automatiskt när bokningar skapas (event-driven!)
          </p>
        </div>

        {isLoading ? (
          <div className="p-6 text-center text-gray-500">Laddar...</div>
        ) : tokens.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            Inga access tokens ännu. Skapa en bokning först!
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
                    Kod
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giltig från
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giltig till
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tokens.map((token) => {
                  const valid = isTokenValid(token.validFrom, token.validUntil);
                  return (
                    <tr key={token.id} className={valid ? '' : 'opacity-50'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {token.roomNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-gray-900">
                        {token.code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(token.validFrom).toLocaleString('sv-SE')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(token.validUntil).toLocaleString('sv-SE')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            valid
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {valid ? 'Giltig' : 'Utgången'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
