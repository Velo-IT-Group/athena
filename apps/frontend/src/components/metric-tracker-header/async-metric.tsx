import { delay } from '@/lib/utils'
import { Conditions } from '@/utils/manage/params'
import React from 'react'

interface Countable<TValue> {
    count: number
    data?: TValue[]
}

interface Props<TData, TValue extends Countable<TData>> {
    label: string
    query?: {
        queryFn: (conditions?: Conditions<TData>) => Promise<TValue>
        params?: Conditions<TData>
        combineFn?: (data: TData[]) => number
    }
    queries?: {
        fns: {
            params?: Conditions<TData>
            queryFn: (
                conditions?: Conditions<TData>
            ) => Promise<Countable<TValue>>
        }[]
        combineFn?: (data: Countable<TValue>[]) => number
    }
    params?: Conditions<TData>
    queryFn?: (conditions?: Conditions<TData>) => Promise<{
        count: number
    }>
    reduceFn?: (data: TData[]) => number
    numberFormat?: Intl.NumberFormatOptions
}

const AsyncMetric = async <T, V extends Countable<T>>({
    label,
    params,
    queryFn,
    numberFormat,
    query,
    queries,
    reduceFn,
}: Props<T, V>) => {
    let value = 0

    const numberFormatter = new Intl.NumberFormat('en-US', numberFormat)

    if (query) {
        const qValue = await query.queryFn(query.params)
        value += query.combineFn
            ? query.combineFn(qValue?.data ?? [])
            : qValue.count
    }

    if (queries) {
        const values = await Promise.all(
            queries?.fns.map((q) => q.queryFn(q.params))
        )
        value += queries.combineFn ? queries.combineFn(values ?? []) : 0
    }

    return (
        <div className="space-y-3 px-3 py-6 border-r last:border-r-0">
            <h4 className="text-xs font-medium text-muted-foreground line-clamp-1">
                {label}
            </h4>

            <p className="text-2xl font-bold">
                {numberFormatter.format(value)}
            </p>
        </div>
    )
}

export default AsyncMetric
