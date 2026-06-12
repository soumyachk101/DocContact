// Catch-all route handler for Auth.js v5.
// Auth.js exports GET/POST from its `handlers` factory; we re-export
// them so the catch-all `[...nextauth]/route.ts` file stays one line.

import { handlers } from './auth';

export const { GET, POST } = handlers;
