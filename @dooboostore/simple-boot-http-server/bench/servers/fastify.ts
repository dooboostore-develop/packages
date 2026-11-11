import Fastify from 'fastify';
import { PORT, ROUTES, UserService } from './_common.ts';
const users = new UserService();
const app = Fastify();
app.get('/hello', async () => ({ hello: 'world' }));
app.get('/users/:id', async (q) => users.find((q.params as any).id));
app.post('/echo', async (q) => q.body);
for (let i = 0; i < ROUTES; i++) app.get('/r/' + i, async () => ({ route: i }));
await app.listen({ port: PORT });
