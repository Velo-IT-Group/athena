import { Progress } from '@/components/ui/progress'
import { getTimeEntriesQuery } from '@/lib/manage/api'
import { cn } from '@/lib/utils'
import { User } from '@supabase/supabase-js'
import { useQuery } from '@tanstack/react-query'
import { endOfDay, startOfDay } from 'date-fns'

interface Props {
    user: User
    className?: string
}

const TimeEntriesProgress = ({ user, className }: Props) => {
    const today = new Date()
    const todayStart = startOfDay(today)
    const todayEnd = endOfDay(today)
    const todayStartString = todayStart.toISOString()
    const todayEndString = todayEnd.toISOString()

    const { data: timeEntries } = useQuery(getTimeEntriesQuery({
        conditions: {
            'member/id':
                user?.user_metadata.member_id ??
                user?.user_metadata.referenceId ?? 310,
            timeStart: {
                value: ` [${todayStartString}]`,
                comparison: '>',
            },
            timeEnd: {
                value: ` [${todayEndString}]`,
                comparison: '<',
            },
        },
        orderBy: { key: 'timeStart' },
        fields: ['actualHours'],
    }))

    const totalHours = timeEntries
        ? timeEntries?.reduce((acc, entry) => acc + entry.actualHours, 0)
        : 0

    return (
        <section
            className={cn(
                'grid grid-cols-[9rem_1fr] items-start w-full py-3',
                className
            )}
        >
            <h2 className="uppercase text-sm font-semibold shrink-0">
                Hours tracked
            </h2>

            <div className="grid grid-cols-8 gap-3 w-full relative">
                <Progress
                    value={Math.floor((totalHours / 8) * 100)}
                    className="col-span-8"
                    indicatorClassName={cn(
                        'bg-destructive',
                        totalHours > 5 && 'bg-yellow-500',
                        totalHours > 7 && 'bg-green-500'
                    )}
                />

                {Array.from({ length: 8 }).map((_, index) => (
                    <div className="w-full flex flex-col items-end" key={index}>
                        <span className="text-muted-foreground">
                            {index + 1}
                        </span>
                    </div>
                ))}

                <span className="text-muted-foreground absolute bottom-0 left-0">
                    0
                </span>
            </div>
        </section>
    )
}

export default TimeEntriesProgress
