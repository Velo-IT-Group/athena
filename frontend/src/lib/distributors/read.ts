export const getIngramPricing = async () => {
	const headers = new Headers();
	headers.append('accept', 'application/json');
	headers.append('IM-CustomerNumber', '20-222222');
	headers.append('IM-CountryCode', 'US');
	headers.append('IM-CorrelationID', 'fbac82ba-cf0a-4bcf-fc03-0c5084');
	headers.append('IM-SenderID', 'MyCompany');
	headers.append('Content-Type', 'application/json');

	try {
		const response = await fetch(env.NGRAM_URL!, {
			headers,
			method: 'POST',
			mode: 'no-cors',
			body: JSON.stringify({
				products: [
					{
						ingramPartNumber: '123512',
					},
				],
			}),
		});

		const products = await response.json();

		return products;
	} catch (error) {
		return new Response(`${error}`, {
			status: 400,
		});
	}
};

export const getSynnexPricing = async () => {
	const headers = new Headers();
	headers.append('accept', 'application/json');
	headers.append('IM-CustomerNumber', '20-222222');
	headers.append('IM-CountryCode', 'US');
	headers.append('IM-CorrelationID', 'fbac82ba-cf0a-4bcf-fc03-0c5084');
	headers.append('IM-SenderID', 'MyCompany');
	headers.append('Content-Type', 'application/json');

	try {
		const response = await fetch(import.meta.env.NEXT_PUBLIC_SYNNEX_URL!);

		const products = await response.json();

		return products;
	} catch (error) {
		return new Response(`${error}`, {
			status: 400,
		});
	}
};
