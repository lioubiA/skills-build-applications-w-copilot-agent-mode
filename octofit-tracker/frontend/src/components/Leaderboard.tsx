import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

interface Ranking {
  teamName: string;
  totalPoints: number;
  rank: number;
}

interface LeaderboardResponse {
  leaderboard: Ranking[];
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<Ranking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getJson<LeaderboardResponse>('/api/leaderboard')
      .then(({ leaderboard: data }) => setLeaderboard(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">Leaderboard</h2>
        <p>Compare team point totals.</p>
        {loading && <p role="status">Loading leaderboard...</p>}
        {error && <p role="alert">Unable to load leaderboard.</p>}
        {!loading && !error && leaderboard.length === 0 && <p role="status">No leaderboard rankings found.</p>}
        {!loading && !error && leaderboard.length > 0 && (
          <ol className="list-group list-group-numbered">
            {leaderboard.map((entry) => (
              <li key={entry.teamName} className="list-group-item">
                <strong>{entry.teamName}</strong>: {entry.totalPoints} points
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
