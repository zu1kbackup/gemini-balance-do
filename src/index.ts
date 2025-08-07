import { Hono } from 'hono';
import { Render } from './render';
import { LoadBalancer } from './handler';

const app = new Hono<{ Bindings: Env }>();

// The / route returns the admin UI.
app.get('/', (c) => {
	return c.html(Render());
});

// All other requests are forwarded to the Durable Object.
// This includes /api/* for the admin panel's backend and the gemini proxy.
app.all('*', async (c) => {
	const id: DurableObjectId = c.env.LOAD_BALANCER.idFromName('loadbalancer');
	const stub = c.env.LOAD_BALANCER.get(id, { locationHint: 'wnam' });
	// Pass the original request to the durable object.
	const resp = await stub.fetch(c.req.raw);
	return new Response(resp.body, {
		status: resp.status,
		headers: resp.headers,
	});
});

export default {
	fetch: app.fetch,
} satisfies ExportedHandler<Env>;

export { LoadBalancer };
