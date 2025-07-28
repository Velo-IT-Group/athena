import { createClient } from "@/utils/twilio";
import { getCompanies, getCompany, getContacts } from "../manage/read";
import { createServerFn } from "@tanstack/react-start";

export const lookupPhoneNumber = createServerFn()
	.validator((from: string) => from)
	.handler(async ({ data: from }) => {
		const client = await createClient();
		const { nationalFormat } = await client.lookups.v2
			.phoneNumbers(from)
			.fetch();

		if (!nationalFormat) return;

		let phoneNumber = nationalFormat.replace(/\D/g, "");
		phoneNumber = phoneNumber.replace(/\(|\)/g, "");

		if (!phoneNumber) return;

		console.log(phoneNumber);

		const [{ data: contacts }, { data: companies }] = await Promise.all([
			getContacts({
				data: {
					conditions: "inactiveFlag = false",
					childConditions: { "communicationItems/value": phoneNumber },
					fields: ["id", "firstName", "lastName", "company", "inactiveFlag"],
				},
			}),
			getCompanies({
				data: {
					conditions: { phoneNumber: phoneNumber },
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
			}
		} else if (contacts.length && !companies.length) {
			if (contacts.length > 2 && contacts.every((c) => !c.inactiveFlag)) {
			}
		}

		if (!contacts.length && !companies.length) {
			return {
				name: nationalFormat,
				territoryName: "TeamA",
			};
		}

		if (!contacts.length && companies.length === 1) {
			return {
				companyId: companies[0].id,
				name: companies[0].name,
				territoryName:
					companies[0].territory?.name.split(" ").join("") ?? "TeamA",
			};
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
						conditions: { fields: ["id", "name", "territory"] },
					},
				});

				return {
					userId: firstContact.id,
					name: firstContact.firstName + " " + firstContact.lastName,
					territoryName:
						company?.territory?.name.split(" ").join("") ?? "TeamA",
				};
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
						conditions: { fields: ["id", "name", "territory"] },
					},
				});

				return {
					companyId: firstContact.company?.id,
					name: company?.name,
					territoryName:
						company?.territory?.name.split(" ").join("") ?? "TeamA",
				};
			}

			return {
				name: nationalFormat,
				territoryName: "TeamA",
			};
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
				? company?.territory?.name.split(" ").join("")
				: "TeamA";

		return {
			userId: user.id,
			companyId: company?.id,
			name: user.firstName + " " + user.lastName,
			territoryName,
		};
	});
