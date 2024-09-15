'use client';

import { useState } from 'react';

export default function TestSuggestSongs() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/suggest-songs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(query),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.message || 'An error occurred');
      }
    } catch (err) {
      setError('Failed to fetch data');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Test Suggest Songs API</h1>
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter your query"
          className="border p-2 mr-2"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Get Suggestions
        </button>
      </form>

      {error && <p className="text-red-500">{error}</p>}

      {result && result.tracks && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Suggested Songs:</h2>
          <ul className="list-disc pl-5">
            {result.tracks.map((track: any, index: number) => (
              <li key={track.id || index} className="mb-2">
                <strong>{track.name}</strong> by {track.artists.map((artist: any) => artist.name).join(', ')}
                {track.album && ` - ${track.album.name}`}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
