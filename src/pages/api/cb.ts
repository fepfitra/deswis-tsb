export const prerender = false

export async function POST({ params, request }) {
	const account = import.meta.env.ACCOUNT;
	const auth = import.meta.env.AUTH;
	console.log("Account:", account);
	console.log("Auth:", auth);
	console.log("Params:", params);
	const body = await request.json();
	console.log("Body:", body);

	let ans = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/autorag/rags/tsb_cb/ai-search`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${auth}`
		},
		body: JSON.stringify({
			query: body.query,
		})
	});

	return new Response(JSON.stringify(await ans.json()));
}
