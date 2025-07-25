import {
	DefinedInitialDataOptions,
	UndefinedInitialDataOptions,
	useQuery,
} from '@tanstack/react-query';

interface Props<T> {
	loadingView?: React.ReactNode;
	errorView?: React.ReactNode;
	itemView: (data: T) => React.ReactNode;
	options:
		| DefinedInitialDataOptions<T[], Error, T[], readonly unknown[]>
		| UndefinedInitialDataOptions<T[], Error, T[], readonly unknown[]>;
}

const QueryList = <T,>({
	options,
	loadingView,
	errorView,
	itemView,
}: Props<T>) => {
	const { data, error, isLoading } = useQuery(options);

	console.log(data);

	if (isLoading) return loadingView ?? <div>Loading...</div>;

	if (error) return errorView ?? <div>Error: {error.message}</div>;

	return <div>{data?.map(itemView)}</div>;
};

export default QueryList;
