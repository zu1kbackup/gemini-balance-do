import { LoadBalancer } from './handler';

/**
 * Welcome to Cloudflare Workers! This is your first Durable Objects application.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your Durable Object in action
 * - Run `npm run deploy` to publish your application
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/durable-objects
 */

export default {
	/**
	 * This is the standard fetch handler for a Cloudflare Worker
	 *
	 * @param request - The request submitted to the Worker from the client
	 * @param env - The interface to reference bindings declared in wrangler.jsonc
	 * @param ctx - The execution context of the Worker
	 * @returns The response to be sent back to the client
	 */
	async fetch(request, env, ctx): Promise<Response> {
		// Create a `DurableObjectId` for an instance of the `MyDurableObject`
		// class named "foo". Requests from all Workers to the instance named
		// "foo" will go to a single globally unique Durable Object instance.
		const id: DurableObjectId = env.LOAD_BALANCER.idFromName('loadbalancer');

		// Create a stub to open a communication channel with the Durable
		// Object instance.
		const stub = env.LOAD_BALANCER.get(id, { locationHint: 'wnam' });

		// Call the `fetch()` RPC method on the stub to
		const resp = await stub.fetch(request);

		return new Response(resp.body, {
			status: resp.status,
			headers: resp.headers,
		});
	},
} satisfies ExportedHandler<Env>;

export { LoadBalancer };
