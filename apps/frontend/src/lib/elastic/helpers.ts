import { createServerFn } from "@tanstack/react-start";
import Client from "@elastic/search-application-client";

export const search = createServerFn()
	.validator((query: string) => query)
	.handler(async ({ data }) => {
		const request = Client(
			"athena-search",
			"http://host.docker.internal:9200/_application/search_application/athena-search/_search",
			"TW1lTVNwWUJLWTNaOEZBU3dMSTE6QzNUUE1vTVlicHdmNmNTUVJEbHItdw==",
			undefined,
			{
				headers: {
					Authorization: "Basic " + btoa("elastic:mis2jjnD"),
					mode: "no-cors",
				},
			},
		);

		const searchData = await request().query(data).search();

		console.log(searchData);

		return searchData;
	});
