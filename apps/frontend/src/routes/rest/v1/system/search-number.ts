import { getCompanies, getCompany, getContacts } from "@/lib/manage/read";
import { createClient } from "@/utils/twilio";
import { attributeIdentifier } from "@athena/utils";
import { createServerFileRoute } from "@tanstack/react-start/server";

export const ServerRoute = createServerFileRoute(
	"/rest/v1/system/search-number",
).methods({
	POST: async ({ request }) => {
		const searchParams = new URL(request.url).searchParams;
		const from = searchParams.get("from");

		if (!from) {
			return Response.json(
				{ error: "Missing 'from' parameter" },
				{ status: 400 },
			);
		}

		const client = await createClient();
		const { nationalFormat } = await client.lookups.v2
			.phoneNumbers(from)
			.fetch();

		if (!nationalFormat) {
			return Response.json(
				{
					error: "No phone number found",
				},
				{ status: 400, statusText: "No phone number found" },
			);
		}

		let phoneNumber = nationalFormat.replace(/\D/g, "");
		phoneNumber = phoneNumber.replace(/\(|\)/g, "");

		if (!phoneNumber) {
			return Response.json(
				{
					error: "No phone number detected",
				},
				{ status: 400, statusText: "No phone number detected" },
			);
		}

		const [{ data: contacts }, { data: companies }] = await Promise.all([
			getContacts({
				data: {
					conditions: { inactiveFlag: false },
					childConditions: { "communicationItems/value": phoneNumber },
					fields: ["id", "firstName", "lastName", "company", "inactiveFlag"],
				},
			}),
			getCompanies({
				data: {
					conditions: { phoneNumber },
					fields: [
						"id",
						"identifier",
						"name",
						"status",
						"phoneNumber",
						"territory",
					],
				},
			}),
		]);

		// No contacts found but found company
		if (!contacts.length && companies.length) {
			if (companies.length > 2) {
				return Response.json(
					attributeIdentifier.parse({
						name: nationalFormat,
						territoryName: "Alpha",
					}),
					{ status: 200 },
				);
			}
		} else if (contacts.length && !companies.length) {
			if (contacts.length > 2 && contacts.every((c) => !c.inactiveFlag)) {
			}
		}

		if (!contacts.length && !companies.length) {
			return Response.json(
				attributeIdentifier.parse({
					name: nationalFormat,
					territoryName: "Alpha",
				}),
				{ status: 200 },
			);
		}

		console.log(contacts, companies);

		if (!contacts.length && companies.length === 1) {
			return Response.json(
				attributeIdentifier.parse({
					companyId: companies[0].id,
					name: companies[0].name,
					territoryName: companies[0].territory?.name ?? "Alpha",
				}),
				{ status: 200 },
			);
		}

		if (contacts.length > 1) {
			const firstContact = contacts[0];
			// Check to see if every contact has the same first name, last name, and a different company
			// This tells the system that this user has multiple contacts with multiple companies
			// If that's the case then return just the users name
			if (
				contacts.every(
					(contact) =>
						(contact.firstName === firstContact.firstName &&
							contact.lastName === firstContact.lastName &&
							contact.company?.id === firstContact.company?.id) ||
						contact.company?.id !== firstContact.company?.id,
				)
			) {
				const company = await getCompany({
					data: {
						id: firstContact.company?.id!,
						conditions: {
							fields: ["id", "name", "territory"],
						},
					},
				});

				return Response.json(
					attributeIdentifier.parse({
						userId: firstContact.id,
						name: firstContact.firstName + " " + firstContact.lastName,
						territoryName: company?.territory?.name ?? "Alpha",
					}),
					{ status: 200 },
				);
			}

			// This tells the system that this phone number has multiple contacts with the same number
			// If that's the case then return just the company
			if (
				contacts.every(
					(contact) => contact.company?.id === firstContact.company?.id,
				)
			) {
				const company = await getCompany({
					data: {
						id: firstContact.company?.id!,
						conditions: {
							fields: ["id", "name", "territory"],
						},
					},
				});

				return Response.json(
					{
						companyId: firstContact.company?.id,
						name: company?.name,
						territoryName: company?.territory?.name ?? "Alpha",
					},
					{ status: 200 },
				);
			}

			return Response.json(
				attributeIdentifier.parse({
					name: nationalFormat,
					territoryName: "Alpha",
				}),
				{ status: 200 },
			);
		}

		const user = contacts[0];

		const company =
			user && user.company
				? await getCompany({
						data: {
							id: user.company.id!,
							conditions: { fields: ["id", "name", "territory"] },
						},
					})
				: (companies[0] ?? undefined);

		const territoryName =
			company?.territory && company?.territory?.name
				? company?.territory?.name
				: "Alpha";

		return Response.json(
			attributeIdentifier.parse({
				userId: user.id,
				companyId: company?.id,
				name: user.firstName + " " + user.lastName,
				territoryName,
			}),
			{ status: 200 },
		);
	},
});
