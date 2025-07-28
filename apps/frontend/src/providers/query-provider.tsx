import { MutationCache, QueryClient, QueryClientProvider, type QueryKey } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { toast } from 'sonner';

declare module '@tanstack/react-query' {
	interface Register {
		mutationMeta: {
			invalidatesQueries?: QueryKey;
			successMessage?: string;
			errorMessage?: string;
		};
	}
}

const queryClient = new QueryClient({
	mutationCache: new MutationCache({
		onSuccess: (_data, _variables, _context, mutation) => {
			if (mutation?.meta?.successMessage) {
				toast.success(mutation.meta.successMessage);
			}
		},
		onError: (_data, _variables, _context, mutation) => {
			if (mutation?.meta?.errorMessage) {
				toast.error(mutation.meta.errorMessage);
			}
		},
		onSettled: (_data, _error, _variables, _context, mutation) => {
			if (mutation?.meta?.invalidatesQueries) {
				queryClient.invalidateQueries({ queryKey: mutation.meta.invalidatesQueries });
			}
		},
	}),
});

export function getContext() {
	return {
		queryClient,
	};
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
	return (
		<QueryClientProvider client={queryClient}>
			{children}
			<ReactQueryDevtools initialIsOpen={false} />
		</QueryClientProvider>
	);
}
