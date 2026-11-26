const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }

  return res.json();
}

export const fetchWorkouts = () => request('/api/workouts');

export const fetchWorkoutById = (id) => request(`/api/workouts/${id}`);

export const askCoach = async (query) => {
  const data = await request('/api/ask', {
    method: 'POST',
    body: JSON.stringify({ query }),
  });

  return {
    text: data.answer,
    sources: data.sources || [],
  };
};

export const askCoachStream = async (query, { onChunk, onSources }) => {
  const res = await fetch(`${API_URL}/api/ask/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const payload = line.slice(6).trim();
      if (payload === '[DONE]') return;

      const parsed = JSON.parse(payload);
      if (parsed.type === 'chunk' && onChunk) {
        onChunk(parsed.content);
      } else if (parsed.type === 'sources' && onSources) {
        onSources(parsed.sources || []);
      }
    }
  }
};