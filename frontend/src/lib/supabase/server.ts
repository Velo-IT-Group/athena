"use server";
import {
	getCookie,
	parseCookies,
	setCookie,
} from "@tanstack/react-start/server";
import { createServerClient } from "@supabase/ssr";
import { env } from "@/lib/utils";
import { createServerFn } from "@tanstack/react-start";
import { jwtVerify } from "jose";
import type { WebToken } from "@/types/crypto";

export const createClient = () =>
	createServerClient<Database>(
		env.VITE_SUPABASE_URL!,
		env.VITE_SUPABASE_ANON_KEY!,
		{
			cookies: {
				getAll() {
					return Object.entries(parseCookies()).map(
						([name, value]) =>
							({
								name,
								value,
							}) as { name: string; value: string },
					);
				},
				setAll(cookies) {
					cookies.forEach((cookie) => {
						setCookie(cookie.name, cookie.value);
					});
				},
			},
		},
	);

export async function getSafeSession() {
	const supabase = createClient();
	const {
		data: { session },
		error,
	} = await supabase.auth.getSession();

	if (error) {
		return { session: null, user: null, error: "No session found" };
	}

	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser();

	if (userError) {
		return { session, user: null, error: userError.message };
	}

	return {
		session,
		user,
		error: null,
	};
}

export const fetchSessionUser = createServerFn().handler(async () => {
	const supabase = createClient();
	const [
		{
			data: { session },
			error,
		},
		{
			data: { user },
			error: userError,
		},
	] = await Promise.all([
		supabase.auth.getSession(),
		supabase.auth.getUser(),
	]);

	return JSON.parse(
		JSON.stringify({
			session,
			user,
			error: error ?? userError,
		}),
	);
});

export const getUserCookie = createServerFn().handler(async () => {
	const cookie = getCookie("connect_wise:auth");

	if (!cookie) {
		throw new Error("No cookie found");
	}

	const jwt = await jwtVerify(
		decodeURIComponent(cookie),
		new TextEncoder().encode(env.VITE_SECRET_KEY),
	);

	return jwt.payload as WebToken;
});
