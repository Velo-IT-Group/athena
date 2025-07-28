import { type Conditions } from "@/utils/manage/params";
import { useState } from "react";

export function useFilterParameters<T>(params?: Conditions<T>) {
	const [parameters, setParameters] = useState<Conditions<T>>(params ?? {});
	const [pagination, setPagination] = useState({
		pageSize: params?.pageSize ?? 20,
		pageIndex: params?.page ?? 0,
	});

	return {
		parameters,
		onParametersChange: setParameters,
		pagination,
		onPaginationChange: setPagination,
	};
}
