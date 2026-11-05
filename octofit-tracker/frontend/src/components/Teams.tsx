import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

interface Team {
  name: string;
  members: string[];
}

interface TeamsResponse {
  teams: Team[];
}

export default function Teams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getJson<TeamsResponse>('/api/teams')
      .then(({ teams: data }) => setTeams(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">Teams</h2>
        <p>Manage teams and members.</p>
        {loading && <p role="status">Loading teams...</p>}
        {error && <p role="alert">Unable to load teams.</p>}
        {!loading && !error && teams.length === 0 && <p role="status">No teams found.</p>}
        {!loading && !error && teams.length > 0 && (
          <ul className="list-group">
            {teams.map((team) => (
              <li key={team.name} className="list-group-item">
                <strong>{team.name}</strong>
                {team.members.length > 0 && <span>: {team.members.join(', ')}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
