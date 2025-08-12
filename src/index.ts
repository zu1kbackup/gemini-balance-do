import { Hono } from 'hono';
import { Render } from './render';
import { LoadBalancer } from './handler';
import { getAuthKey } from './auth';
import { getCookie, setCookie } from 'hono/cookie';

const app = new Hono<{ Bindings: Env }>();

// The / route returns the admin UI.
app.get('/', (c) => {
	const sessionKey = getCookie(c, 'auth-key');
	const authKey = getAuthKey(c.req.raw, sessionKey);
	if (authKey !== c.env.AUTH_KEY) {
		return c.html(Render({ isAuthenticated: false, showWarning: false }));
	}
	const showWarning = c.env.AUTH_KEY === 'ajielu';
	return c.html(Render({ isAuthenticated: true, showWarning }));
});

app.post('/', async (c) => {
	const { key } = await c.req.json();
	if (key === c.env.AUTH_KEY) {
		setCookie(c, 'auth-key', key, { maxAge: 60 * 60 * 24 * 30, path: '/' });
		return c.json({ success: true });
	}
	return c.json({ success: false }, 401);
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

type Env = {
	LOAD_BALANCER: DurableObjectNamespace<LoadBalancer>;
	AUTH_KEY: string;
};
