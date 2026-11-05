import { useState, type FormEvent } from 'react';
import { CapabilityCard } from './CapabilityCard.js';

export default function Workouts() {
  const [email, setEmail] = useState('mona@example.com');
  const [requestedEmail, setRequestedEmail] = useState('mona@example.com');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRequestedEmail(email.trim());
  }

  return <CapabilityCard
    title="Workout suggestions"
    description="Recommend workouts from activity patterns."
    endpoint={`/api/workouts/suggestions/${encodeURIComponent(requestedEmail)}`}
    dataKey="suggestions"
    emptyLabel="workout suggestions"
  >
    <form className="mb-3" onSubmit={handleSubmit}>
      <label className="form-label" htmlFor="workout-user-email">User email</label>
      <div className="input-group">
        <input
          autoComplete="email"
          className="form-control"
          id="workout-user-email"
          onChange={(event) => setEmail(event.target.value)}
          required
          type="email"
          value={email}
        />
        <button className="btn btn-primary" type="submit">Get suggestions</button>
      </div>
    </form>
  </CapabilityCard>;
}
