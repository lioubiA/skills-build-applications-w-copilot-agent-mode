import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

interface Activity {
  type: string;
  minutes: number;
  points: number;
}

interface ActivitiesResponse {
  activities: Activity[];
}

export default function Activities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getJson<ActivitiesResponse>('/api/activities')
      .then((data) => {
        setActivities(data.activities);
        setError(null);
      })
      .catch((err) => {
        setError('Unable to load activities');
        setActivities([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">Activities</h2>
        <p>Track student activity minutes and points.</p>

        {loading && <p role="status">Loading activities...</p>}

        {error && (
          <div role="alert" className="alert alert-danger">
            {error}
          </div>
        )}

        {!loading && !error && activities.length === 0 && (
          <p role="status">No activities found.</p>
        )}

        {!loading && !error && activities.length > 0 && (
          <ul className="list-group">
            {activities.map((activity, index) => (
              <li key={index} className="list-group-item">
                <strong>{activity.type}</strong>: {activity.minutes} minutes, {activity.points} points
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
