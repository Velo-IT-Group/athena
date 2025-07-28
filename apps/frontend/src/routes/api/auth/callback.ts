import { createServerFileRoute } from "@tanstack/react-start/server";
import { createClient } from "@/lib/supabase/server";
import { getSystemMember, getSystemMembers } from "@/lib/manage/read";
import { UserMetadata } from "@supabase/supabase-js";

export const ServerRoute = createServerFileRoute("/api/auth/callback").methods({
	GET: async ({
		request,
		params,
	}: {
		request: Request;
		params: Record<string, string | undefined>;
	}) => {
		const url = new URL(request.url);
		const { searchParams, origin } = url;

		const code = searchParams.get("code");
		const next = searchParams.get("next");

		if (!code) {
			return Response.redirect(
				`${origin}/auth/auth-code-error?error=No code found`,
			);
		}

		const supabase = createClient();

		const {
			error,
			data: { session, user },
		} = await supabase.auth.exchangeCodeForSession(code);

		if (!user) {
			return Response.redirect(
				`${origin}/auth/auth-code-error?error=${
					error ? error.message : "No user found"
				}`,
			);
		}

		const { data, error: profile_key_error } = await supabase
			.from("profile_keys")
			.select()
			.eq("user_id", user?.id)
			.single();

		if (profile_key_error) {
			if (error) {
				return Response.redirect(
					`${origin}/auth/auth-code-error?error=${error.message}`,
				);
			}
		}

		const members = await getSystemMembers({
			data: {
				conditions: { officeEmail: user?.email },
				fields: ["id", "salesDefaultLocation", "identifier"],
			},
		});

		if (!members?.length) {
			return Response.redirect(
				`${origin}/auth/auth-code-error?error=No members found`,
			);
		}

		const member = members[0];

		const user_metadata: UserMetadata = {
			...user?.user_metadata,
			contact_uri: `client:${member.identifier}`,
			// contact_id: contacts?.[0]?.id,
			member_id: member?.id,
			team_id: member?.salesDefaultLocation?.id,
			team_name: member?.salesDefaultLocation?.name,
			identifier: member?.identifier,
		};

		const { error: updateError } = await supabase.auth.updateUser({
			data: user_metadata,
		});

		if (updateError) {
			return Response.redirect(
				`${origin}/auth/auth-code-error?error=${updateError.message}`,
			);
		}

		return Response.redirect(`${origin}/`);

		// if (code) {
		// const supabase = createClient();

		// const {
		// 	data: { user },
		// 	error,
		// } = await supabase.auth.exchangeCodeForSession(code);

		// const { data, error: profile_key_error } = await supabase.from(
		// 	"profile_keys",
		// ).select().single();

		// 	if (profile_key_error) {
		// 		return Response.redirect(
		// 			`${origin}/token-setup?user_id=${user?.id}`,
		// 		);
		// 	}

		// 	setCookie("connect_wise:auth", JSON.stringify(data?.key));
		// 	setCookie("twilio:worker_sid", user?.user_metadata?.worker_sid);

		// 	if (error) {
		// 		const urlParams = new URLSearchParams();
		// 		urlParams.append("error", error.message);

		// 		// return the user to an error page with instructions
		// 		return Response.redirect(
		// 			`${origin}/auth/auth-code-error?${urlParams.toString()}`,
		// 		);
		// 	}

		// 	if (!user) {
		// 		const urlParams = new URLSearchParams();
		// 		urlParams.append("error", "No user found");
		// 		return Response.redirect(
		// 			`${origin}/auth/auth-code-error?${urlParams.toString()}`,
		// 		);
		// 	}

		// 	// try {
		// 	// 	const newMetaData = await handleAuthenticatedUser(user);
		// 	// 	await supabase.auth.updateUser({ data: newMetaData });
		// 	// } catch (error) {
		// 	// 	console.error("Error updating user metadata", error);
		// 	// 	const urlParams = new URLSearchParams();
		// 	// 	urlParams.append(
		// 	// 		"error",
		// 	// 		"Error updating user metadata " + (error as Error).message,
		// 	// 	);
		// 	// 	return Response.redirect(
		// 	// 		`${origin}/auth/auth-code-error?${urlParams.toString()}`,
		// 	// 	);
		// 	// }

		// 	return Response.redirect(`${origin}${next ?? "/proposals"}`);
		// }

		// // return the user to an error page with instructions
		// return Response.json({
		// 	error: "Not authenticated",
		// })
	},
});

// const handleAuthenticatedUser = async (user: User) => {
// 	const email = user.email;

// 	if (!email) throw new Error("No email found on user");

// 	console.log(getSystemMembers);

// 	const [members, { data: contacts }] = await Promise.all([
// 		getSystemMembers({
// 			data: {
// 				conditions: { officeEmail: `'${email}'` },
// 				fields: ["id", "salesDefaultLocation"],
// 			},
// 		}),
// 		getContacts({
// 			data: {
// 				childConditions: {
// 					"communicationItems/value": `'${email}'`,
// 				},
// 				fields: ["id"],
// 			},
// 		}),
// 	]);

// 	const workers = await getWorkers({ data: { friendlyName: email } });

// const user_metadata: UserMetadata = {
// 	...user?.user_metadata,
// 	contact_uri: `client:${email}`,
// 	contact_id: contacts?.[0]?.id,
// 	member_id: members?.[0]?.id,
// 	team_id: members?.[0]?.salesDefaultLocation?.id,
// 	team_name: members?.[0]?.salesDefaultLocation?.name,
// 	identifier: members?.[0]?.identifier,
// };

// 	if (!workers.length) {
// 		const worker = await createWorker(email, {
// 			...user_metadata,
// 			on_call: false,
// 			contact_id: contacts?.[0]?.id,
// 			member_id: members?.[0]?.id,
// 			team_id: members?.[0]?.salesDefaultLocation?.id,
// 			team_name: members?.[0]?.salesDefaultLocation?.name,
// 			identifier: members?.[0]?.identifier,
// 			active: true,
// 		});

// 		user_metadata.on_call = false;
// 		user_metadata.worker_sid = worker?.sid;
// 	} else {
// 		const worker = workers[0];
// 		const parsedAttributes = JSON.parse(worker.attributes);
// 		user_metadata.on_call = parsedAttributes.on_call ?? false;
// 		user_metadata.worker_sid = worker.sid;

// 		await updateWorker({
// 			data: {
// 				workerSid: worker.sid,
// 				options: {
// 					attributes: {
// 						...parsedAttributes,
// 						...user_metadata,
// 						contact_uri: `client:${email}`,
// 						on_call: parsedAttributes.on_call ?? false,
// 						contact_id: contacts?.[0]?.id,
// 						member_id: members?.[0]?.id,
// 						team_id: members?.[0]?.salesDefaultLocation?.id,
// 						team_name: members?.[0]?.salesDefaultLocation?.name,
// 						identifier: members?.[0]?.identifier,
// 					},
// 				},
// 			},
// 		});
// 	}

// 	delete user_metadata?.workerSid;
// 	delete user_metadata?.contactId;
// 	delete user_metadata?.referenceId;

// 	return user_metadata;
// };

// const getSystemMembers = async (
// 	{ data }: { data: Conditions<SystemMember> },
// ) => {
// 	console.log(data);
// 	const response = await fetch(
// 		`${env.VITE_CONNECT_WISE_URL}/system/members/${generateParams(data)}`,
// 		{
// 			headers: baseHeaders,
// 		},
// 	);

// 	if (!response.ok) {
// 		throw new Error(
// 			"Error fetching system members... " + response.statusText,
// 			{
// 				cause: response.statusText,
// 			},
// 		);
// 	}

// 	return await response.json();
// };

// const getContacts = async (
// 	{ data }: { data: Conditions<Contact> },
// ) => {
// 	const [response, countResponse] = await Promise.all([
// 		await fetch(
// 			`${env.VITE_CONNECT_WISE_URL}/company/contacts/${
// 				generateParams(data)
// 			}`,
// 			{
// 				headers: baseHeaders,
// 			},
// 		),
// 		await fetch(
// 			`${env.VITE_CONNECT_WISE_URL}/company/contacts/count${
// 				generateParams(data)
// 			}`,
// 			{
// 				headers: baseHeaders,
// 			},
// 		),
// 	]);

// 	return {
// 		data: await response.json(),
// 		count: (await countResponse.json()).count,
// 	};
// };

// export const getWorkers = async (
// 	{ data }: { data: WorkerListInstanceOptions },
// ) => {
// 	const client = await createTwilioClient();
// 	return (await client.taskrouter.v1.workspaces(
// 		env.VITE_TWILIO_WORKSPACE_SID!,
// 	).workers.list(data)).map((w) => w.toJSON());
// };

// const createWorker = async (
// 	friendlyName: string,
// 	attributes: Record<string, any>,
// ) => {
// 	const client = await createTwilioClient();

// 	const worker = await client.taskrouter.v1.workspaces(
// 		env.VITE_TWILIO_WORKSPACE_SID,
// 	).workers.create({
// 		friendlyName,
// 		attributes: JSON.stringify(attributes),
// 	});

// 	return worker;
// };

// const updateWorker = async (
// 	{ data: { workerSid, options } }: {
// 		data: { workerSid: string; options: WorkerContextUpdateOptions };
// 	},
// ) => {
// 	const client = await createTwilioClient();
// 	return (await client.taskrouter.v1
// 		.workspaces(env.VITE_TWILIO_WORKSPACE_SID!)
// 		.workers(workerSid)
// 		.update(options)).toJSON();
// };
