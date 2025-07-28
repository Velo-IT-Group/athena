'use client'

import * as React from 'react'
import { subDays } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

export function DateTimePicker({
    defaultDate,
    onDateChange,
}: {
    defaultDate: Date
    queryParam: string
    onDateChange?: (date: Date) => void
}) {
    const [date, setDate] = React.useState<Date>(defaultDate)
    const now = new Date()

    const hours = Array.from(
        {
            length:
                now.getDate() === date.getDate()
                    ? now.getHours() > 12
                        ? now.getHours() - 12
                        : now.getHours()
                    : 12,
        },
        (_, i) => i + 1
    )
    const handleDateSelect = (selectedDate: Date | undefined) => {
        if (selectedDate) {
            const now = new Date()

            setDate(selectedDate > now ? now : selectedDate)
            onDateChange?.(selectedDate > now ? now : selectedDate)
        }
    }

    const handleTimeChange = (
        type: 'hour' | 'minute' | 'ampm',
        value: string
    ) => {
        if (date) {
            const newDate = new Date(date)
            if (type === 'hour') {
                newDate.setHours(
                    (parseInt(value) % 12) + (newDate.getHours() >= 12 ? 12 : 0)
                )
            } else if (type === 'minute') {
                newDate.setMinutes(parseInt(value))
            } else if (type === 'ampm') {
                const currentHours = newDate.getHours()
                newDate.setHours(
                    value === 'PM' ? currentHours + 12 : currentHours - 12
                )
            }
            const now = new Date()
            setDate(newDate > now ? now : newDate)
            onDateChange?.(newDate > now ? now : newDate)
        }
    }

    return (
        <div className="sm:flex">
            <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateSelect}
                initialFocus
                // disabled={{ before: new Date() }}
                disabled={{
                    before: subDays(new Date(), 15),
                    after: new Date(),
                }}
            />
            <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
                <ScrollArea className="w-64 sm:w-auto">
                    <div className="flex sm:flex-col p-2">
                        {hours.reverse().map((hour) => (
                            <Button
                                key={hour}
                                size="icon"
                                variant={
                                    date && date.getHours() % 12 === hour % 12
                                        ? 'default'
                                        : 'ghost'
                                }
                                className="sm:w-full shrink-0 aspect-square"
                                onClick={() =>
                                    handleTimeChange('hour', hour.toString())
                                }
                            >
                                {hour}
                            </Button>
                        ))}
                    </div>
                    <ScrollBar orientation="horizontal" className="sm:hidden" />
                </ScrollArea>

                <ScrollArea className="w-64 sm:w-auto">
                    <div className="flex sm:flex-col p-2">
                        {Array.from({ length: 12 }, (_, i) => i * 5).map(
                            (minute) => (
                                <Button
                                    key={minute}
                                    size="icon"
                                    variant={
                                        date && date.getMinutes() === minute
                                            ? 'default'
                                            : 'ghost'
                                    }
                                    className="sm:w-full shrink-0 aspect-square"
                                    onClick={() =>
                                        handleTimeChange(
                                            'minute',
                                            minute.toString()
                                        )
                                    }
                                >
                                    {minute}
                                </Button>
                            )
                        )}
                    </div>
                    <ScrollBar orientation="horizontal" className="sm:hidden" />
                </ScrollArea>
                <ScrollArea className="">
                    <div className="flex sm:flex-col p-2">
                        {['AM', 'PM'].map((ampm) => (
                            <Button
                                key={ampm}
                                size="icon"
                                variant={
                                    date &&
                                    ((ampm === 'AM' && date.getHours() < 12) ||
                                        (ampm === 'PM' &&
                                            date.getHours() >= 12))
                                        ? 'default'
                                        : 'ghost'
                                }
                                className="sm:w-full shrink-0 aspect-square"
                                onClick={() => handleTimeChange('ampm', ampm)}
                            >
                                {ampm}
                            </Button>
                        ))}
                    </div>
                </ScrollArea>
            </div>
        </div>
    )
}
