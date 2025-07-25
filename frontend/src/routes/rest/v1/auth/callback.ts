import { getContacts, getSystemMembers } from "@/lib/manage/read";
import { createClient } from "@/lib/supabase/server";
import { getWorkers } from "@/lib/twilio/read";
import { User } from "@supabase/supabase-js";
import { createWorker } from "@/lib/twilio/create";
import {
    createServerFileRoute,
    deleteCookie,
    setCookie,
} from "@tanstack/react-start/server";
import { updateWorker } from "@/lib/twilio/update";
import { WorkerAttributes } from "@/types/twilio";
import { env } from "@/lib/utils";

const handleAuthenticatedUser = async (user: User) => {
    const supabase = createClient();

    const email = user.email;

    if (!email) throw new Error("No email found on user");

    const [members, { data: contacts }] = await Promise.all([
        getSystemMembers({
            data: {
                conditions: { officeEmail: email },
                fields: [
                    "id",
                    "salesDefaultLocation",
                    "identifier",
                    "firstName",
                    "lastName",
                    "title",
                    "officePhone",
                    "mobilePhone",
                    "title",
                    "securityRole",
                ],
            },
        }),
        getContacts({
            data: {
                childConditions: {
                    "communicationItems/value": email,
                },
                fields: ["id"],
            },
        }),
    ]);

    console.log(members, contacts);

    if (!members?.length) {
        throw new Error("No members found for the user");
    }

    const member = members[0]!;

    const workers = await getWorkers({ data: { friendlyName: email } });

    const user_metadata: WorkerAttributes = {
        contact_uri: `client:${member.identifier}`,
        contact_id: contacts?.[0]?.id,
        member_id: member.id,
        team_name: member.salesDefaultLocation?.name || "Alpha",
        active: true,
        on_call: false,
        email,
        full_name: `${member.firstName} ${member.lastName}`,
        identity: member.identifier,
        job_title: member.title || "",
        work_phone: member.officePhone || "",
        mobile_phone: member.mobilePhone || "",
        security_role_id: member.securityRole?.id || -1,
    };

    console.log("USER ID ", user.id);

    if (!workers.length) {
        const worker = await createWorker({
            data: {
                friendlyName: email,
                attributes: user_metadata,
            },
        });

        const { error: profileUpdateError } = await supabase.from("profiles")
            .update({
                worker_sid: worker.sid,
            }).eq("id", user.id);

        if (profileUpdateError) throw profileUpdateError;
    } else {
        const worker = workers[0];
        const parsedAttributes = JSON.parse(worker.attributes);
        user_metadata.on_call = parsedAttributes.on_call ?? false;

        await updateWorker({
            data: {
                workerSid: worker.sid,
                options: {
                    attributes: JSON.stringify(user_metadata),
                },
            },
        });

        console.log(worker);

        const { data, error: profileUpdateError, statusText, status } =
            await supabase
                .from("profiles")
                .update({
                    worker_sid: worker.sid,
                }).eq("id", user.id).select().maybeSingle();

        console.error(data, profileUpdateError, statusText, status);

        if (profileUpdateError) throw profileUpdateError;
    }

    return user_metadata;
};

export const ServerRoute = createServerFileRoute("/rest/v1/auth/callback")
    .methods({
        GET: async ({ request }) => {
            const { searchParams, origin } = new URL(request.url);
            const code = searchParams.get("code");
            const next = searchParams.get("next") ?? "/";

            if (code) {
                const supabase = createClient();
                const {
                    data: { user },
                    error,
                } = await supabase.auth.exchangeCodeForSession(code);
                const { data, error: profile_key_error } = await supabase
                    .from("profile_keys")
                    .select()
                    .single();

                console.log(data);

                if (!data || profile_key_error) {
                    return Response.redirect(
                        `${origin}/auth/token-setup?user_id=${user?.id}`,
                    );
                }

                deleteCookie("connect_wise:auth");
                setCookie("connect_wise:auth", JSON.stringify(data?.key));
                setCookie("twilio:worker_sid", user?.user_metadata?.worker_sid);

                if (error) {
                    const urlParams = new URLSearchParams();
                    urlParams.append("error", error.message);

                    // return the user to an error page with instructions
                    return Response.redirect(
                        `${origin}/auth/auth-code-error?${urlParams.toString()}`,
                    );
                }

                const forwardedHost = request.headers.get("x-forwarded-host");
                const isLocalEnv = env.MODE === "development";

                if (!user) {
                    return Response.redirect(`${origin}/auth/auth-code-error`);
                }

                try {
                    const newMetaData = await handleAuthenticatedUser(user);
                    console.log(newMetaData);
                    await supabase.auth.updateUser({ data: newMetaData });
                } catch (error) {
                    console.error("Error updating user metadata", error);
                    return Response.redirect(`${origin}/auth/auth-code-error`);
                }

                if (isLocalEnv) {
                    return Response.redirect(`${origin}${next}`);
                } else if (forwardedHost) {
                    return Response.redirect(`${origin}${next}`);
                } else {
                    return Response.redirect(`${origin}${next}`);
                }
            }

            // return the user to an error page with instructions
            return Response.redirect(`${origin}/auth/auth-code-error`);
        },
    });
