import { describe, expect, it } from 'vitest';

import { OPTIONS } from './route';

describe('graphql BFF OPTIONS (SOPET-H-06)', () => {
  it('returns 204 without reflecting arbitrary Origin or credentials', async () => {
    const response = await OPTIONS();

    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBeNull();
    expect(response.headers.get('Access-Control-Allow-Credentials')).toBeNull();
    expect(response.headers.get('Access-Control-Allow-Methods')).toBeNull();
  });

  it('does not emit CORS allow headers', async () => {
    const response = await OPTIONS();

    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBeNull();
    expect(response.headers.get('Access-Control-Allow-Credentials')).toBeNull();
  });
});
