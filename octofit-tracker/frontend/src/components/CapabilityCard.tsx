import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Props = {
  title: string;
  description: string;
  endpoint: string;
  dataKey: string;
  emptyLabel: string;
};

type Item = Record<string, unknown>;
type ViewState =
  | { status: 'loading' }
  | { status: 'success'; items: Item[] }
  | { status: 'error'; message: string };

function isItem(value: unknown): value is Item {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function formatValue(value: unknown): string {
  if (Array.isArray(value)) return value.join(', ');
  if (value !== null && typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export function CapabilityCard({ title, description, endpoint, dataKey, emptyLabel }: Props) {
  const [state, setState] = useState<ViewState>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    setState({ status: 'loading' });

    getJson<Record<string, unknown>>(endpoint)
      .then((response) => {
        const data = response[dataKey];
        if (!Array.isArray(data) || !data.every(isItem)) {
          throw new Error(`Invalid ${dataKey} response`);
        }
        if (active) setState({ status: 'success', items: data });
      })
      .catch((error: unknown) => {
        if (active) {
          setState({
            status: 'error',
            message: error instanceof Error ? error.message : String(error),
          });
        }
      });

    return () => {
      active = false;
    };
  }, [dataKey, endpoint]);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">{title}</h2>
        <p>{description}</p>
        {state.status === 'loading' && <p role="status">Loading {title.toLowerCase()}...</p>}
        {state.status === 'error' && (
          <p role="alert">Unable to load {title.toLowerCase()}. {state.message}</p>
        )}
        {state.status === 'success' && state.items.length === 0 && (
          <p>No {emptyLabel} yet.</p>
        )}
        {state.status === 'success' && state.items.length > 0 && (
          <ul aria-label={`${title} results`} className="list-group">
            {state.items.map((item, index) => (
              <li className="list-group-item" key={index}>
                <dl className="mb-0">
                  {Object.entries(item).map(([field, value]) => (
                    <div key={field}>
                      <dt>{field}</dt>
                      <dd>{formatValue(value)}</dd>
                    </div>
                  ))}
                </dl>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
