import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

interface Suggestion {
  title: string;
  reason: string;
}

interface SuggestionsResponse {
  suggestions: Suggestion[];
}

export default function Workouts() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const userEmail = encodeURIComponent('mona@example.com');
    getJson<SuggestionsResponse>(`/api/workouts/suggestions/${userEmail}`)
      .then(({ suggestions: data }) => setSuggestions(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">Workout suggestions</h2>
        <p>Recommend workouts from activity patterns.</p>
        {loading && <p role="status">Loading workout suggestions...</p>}
        {error && <p role="alert">Unable to load workout suggestions.</p>}
        {!loading && !error && suggestions.length === 0 && <p role="status">No workout suggestions found.</p>}
        {!loading && !error && suggestions.length > 0 && (
          <ul className="list-group">
            {suggestions.map((suggestion) => (
              <li key={suggestion.title} className="list-group-item">
                <strong>{suggestion.title}</strong>: {suggestion.reason}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
