import { workerAttributesSchema } from '@athena/utils';
import type { AuthError, Session, User } from '@supabase/supabase-js';
import {
	type UseMutationResult,
	useMutation,
	useQuery,
} from '@tanstack/react-query';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { Loader2 } from 'lucide-react';
import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useMemo,
} from 'react';
import { toast } from 'sonner';
import VeloLogo from '@/components/logo';
import { createClient } from '@/lib/supabase/client';
import { getAccessTokenQuery } from '@/lib/twilio/api';
import { cn } from '@/lib/utils';

const AuthContext = createContext<{
	user?: User;
	session?: Session;
	handleSocialLogin?: UseMutationResult<void, Error, void, unknown>;
	handleSignOut?: UseMutationResult<
		{
			error: AuthError | null;
		},
		Error,
		void,
		unknown
	>;
	accessToken?: string;
	workerSid?: string;
	identity?: string;
}>({});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	// const [user, setUser] = useLocalStorage('user', null);
	// const { pathname, search } = useLocation();
	const navigate = useNavigate();
	const supabase = createClient();

	const { data, isLoading } = useQuery({
		queryKey: ['user'],
		queryFn: async () => {
			const {
				data: { session },
				error,
			} = await supabase.auth.getSession();

			if (error || !session) throw navigate({ to: '/auth/login' });

			return { user: session.user, session };
		},
		staleTime: (query) =>
			(query?.state?.data?.session?.expires_in ?? 0) * 1000,
		select: (data) => {
			const attributes = workerAttributesSchema.parse(
				data.user.user_metadata
			);
			return {
				user: data?.user,
				session: data?.session,
				attributes,
				identity: data.user?.email ?? attributes.identity,
			};
		},
	});

	useQuery({
		...getAccessTokenQuery({
			identity: data?.user?.email ?? data?.attributes.identity ?? '',
			workerSid: data?.user.user_metadata.worker_sid,
		}),
		enabled: data?.user?.email !== undefined,
	});

	// // call this function when you want to authenticate the user
	// const handlePassswordLogin = useMutation({
	// 	mutationFn: async (e: React.FormEvent<HTMLFormElement>) => {
	// 		e.preventDefault();

	// 		const { data, error } = await supabase.auth.signInWithPassword({
	// 			email: 'nicholas.black98@icloud.com',
	// 			password: 'Bl@ck1998!',
	// 		});

	// 		if (error) throw error;

	// 		// redirect({ to: '/' });
	// 	},
	// 	onError(error) {
	// 		console.log(error);
	// 		toast.error(error.message);
	// 	},
	// 	onSuccess(data, variables, context) {
	// 		navigate({ to: '/' });
	// 	},
	// });

	// const handleSocialLogin = useMutation({
	// 	mutationFn: async () => {
	// 		const params = new URLSearchParams();

	// 		// if (search.redirect) {
	// 		// 	params.set('next', search.redirect);
	// 		// }

	// 		const { error } = await supabase.auth.signInWithOAuth({
	// 			provider: 'azure',
	// 			options: {
	// 				scopes: 'offline_access openid profile email User.Read Calendars.ReadBasic Calendars.Read Calendars.ReadWrite',
	// 				redirectTo:
	// 					// `${window.location.origin}/rest/v1/auth/callback` +
	// 					`?${params.toString()}`,
	// 			},
	// 		});

	// 		if (error) throw error;
	// 	},
	// });

	// const handleSignOut = useMutation({
	// 	mutationFn: async () => supabase.auth.signOut(),
	// 	onError(error, variables, context) {
	// 		toast.error(
	// 			'There was an error in signing you out: ' + error.message
	// 		);
	// 	},
	// 	onSuccess: () => {
	// 		toast.success('Signed out successfully');
	// 		// navigate({ to: '/auth/login' });
	// 	},
	// });

	// useEffect(() => {
	// 	const authListener = supabase.auth.onAuthStateChange(
	// 		(event, session) => {
	// 			if (session && session.provider_token) {
	// 				window.localStorage.setItem(
	// 					'oauth_provider_token',
	// 					session.provider_token
	// 				);
	// 			}
	// 			if (session && session.provider_refresh_token) {
	// 				window.localStorage.setItem(
	// 					'oauth_provider_refresh_token',
	// 					session.provider_refresh_token
	// 				);
	// 			}
	// 			if (event === 'SIGNED_OUT') {
	// 				window.localStorage.removeItem('oauth_provider_token');
	// 				window.localStorage.removeItem(
	// 					'oauth_provider_refresh_token'
	// 				);
	// 			}
	// 		}
	// 	);

	// 	return () => {
	// 		authListener.data.subscription.unsubscribe();
	// 	};
	// }, []);

	// const value = useMemo(
	// 	() => ({
	// 		...data,
	// 		handleSocialLogin,
	// 		handleSignOut,
	// 		accessToken,
	// 		workerSid: data?.user.user_metadata.worker_sid,
	// 	}),
	// 	[data?.user, handleSocialLogin, handleSignOut, accessToken]
	// );

	return (
		<AuthContext.Provider value={{}}>
			{children}
			{/* {isLoading || isLoadingAccessToken ? (
				<div
					className={cn(
						'absolute w-full h-full bg-black grid place-items-center z-[100000000000]'
					)}
				>
					<div className='relative grid place-items-center'>
						<VeloLogo className='size-52 text-white fill-white absolute ' />
						<Loader2 className='size-60 animate-spin' />
					</div>
				</div>
			) : (
				<div>{children}</div>
			)} */}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	return useContext(AuthContext);
};
