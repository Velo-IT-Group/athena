const formatter = new Intl.RelativeTimeFormat('en', { style: 'short' })

export function relativeDate(date: Date) {
    const now = new Date()
    const diff: number = Math.round(
        (now.getTime() - (date?.getTime() ? date.getTime() : 0)) / 1000
    )

    const minute = 60
    const hour = minute * 60
    const day = hour * 24
    const week = day * 7
    const month = day * 30
    const year = month * 12

    if (diff < minute) {
        return formatter.format(-diff, 'seconds')
    } else if (diff < hour) {
        return formatter.format(-Math.floor(diff / minute), 'minutes')
    } else if (diff < day) {
        return formatter.format(-Math.floor(diff / hour), 'hours')
    } else if (diff < week) {
        return formatter.format(-Math.floor(diff / day), 'days')
    } else if (diff < month) {
        return formatter.format(-Math.floor(diff / week), 'weeks')
    } else if (diff < year && diff < year) {
        return formatter.format(-Math.floor(diff / month), 'months')
    } else {
        return formatter.format(-Math.floor(diff / year), 'years')
    }
}

// Formatter for "Today" and "Yesterday" etc
const relative = new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' })
// Formatter for weekdays, e.g. "Monday"
const short = new Intl.DateTimeFormat('en-US', { weekday: 'long' })
// Formatter for dates, e.g. "Mon, 31 May 2021"
const long = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
})

export const relativeDay = (date: Date) => {
    const now = new Date().setHours(0, 0, 0, 0)
    const then = date.setHours(0, 0, 0, 0)
    const days = (then - now) / 86400000
    if (days > -6) {
        if (days > -2) {
            return relative.format(days, 'day')
        }
        return short.format(date)
    }
    return long.format(date)
}

export function addSeconds(date: Date, seconds: number) {
    date.setSeconds(date.getSeconds() + seconds)
    return date
}

export const formatDate = (options?: Intl.DateTimeFormatOptions) => {
    return new Intl.DateTimeFormat('en', options)
}

const dateRegex =
    /\w+ by \w+ (\d{2})\/(\d{2}) (\d{1,2}):(\d{2}) (AM|PM) UTC([+-]\d{2})/

export const extractDateFromSlaStatus = (
    text: string
): { actionText: string; date: Date } | null => {
    if (!text) return null

    const dateMatches = text.match(dateRegex)

    if (!dateMatches) {
        return null
    }

    const [, month, day, hour, minute, period, timezoneOffset] = dateMatches

    // Convert to 24-hour format
    let hour24 = parseInt(hour, 10)
    if (period === 'PM' && hour24 !== 12) {
        hour24 += 12
    } else if (period === 'AM' && hour24 === 12) {
        hour24 = 0
    }

    // Create a Date object
    const now = new Date()
    const year = now.getFullYear() // Assuming the current year
    const date = new Date(
        Date.UTC(
            year,
            parseInt(month, 10) - 1,
            parseInt(day, 10),
            hour24,
            parseInt(minute, 10)
        )
    )

    // Adjust for the timezone offset
    const offsetHours = parseInt(timezoneOffset, 10)
    date.setUTCHours(date.getUTCHours() + offsetHours)

    const textRegex = /\w+ by/
    const textMatch = text.match(textRegex)

    return {
        actionText: textMatch ? textMatch[0] : '',
        date,
    }
}

export const getDateOffset = (date: Date | string) => {
    const dateUpdated: Date = typeof date === 'string' ? new Date(date) : date
    const taskUpdateTime = dateUpdated.getTime()
    const currentTime = new Date().getTime()
    const timeDifference = currentTime - taskUpdateTime
    const timeDifferenceInSeconds = Math.floor(timeDifference / 1000)

    const stopwatchOffset = new Date()
    stopwatchOffset.setSeconds(
        stopwatchOffset.getSeconds() + timeDifferenceInSeconds
    )

    return stopwatchOffset
}
