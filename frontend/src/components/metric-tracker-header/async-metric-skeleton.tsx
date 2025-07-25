import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

interface Props {
    label: string
}

const AsyncMetricSkeleton = ({ label }: Props) => {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3">
                <CardTitle className="text-sm font-medium truncate">
                    {label}
                </CardTitle>
            </CardHeader>

            <CardContent className="pb-3 px-3">
                <Skeleton className="h-8 w-1/4" />
            </CardContent>
        </Card>
    )
}

export default AsyncMetricSkeleton
