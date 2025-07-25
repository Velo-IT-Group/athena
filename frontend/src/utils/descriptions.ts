import { parsePhoneNumber } from '@/lib/utils'
import type { Contact } from '@/types/manage'
import { Direction } from '@/types/twilio'
import { ReactNode } from 'react'

export const callDescription = (
    c: Conversation,
    profiles: Profile[],
    contact: Contact,
    contacts: Contact[]
): ReactNode => {
    const isVoicemail = c?.workflow === 'Voicemail'
    const profile = profiles?.find((p) => c.agent === p.worker_sid)

    let user = ''
    if (contact) {
        user = `${contact?.firstName} ${contact?.lastName}`
    } else {
        const contact = contacts?.find((contact) => {
            return contact.id === c.contact_id
        })

        user = `${contact?.firstName ?? 'Unknown'} ${contact?.lastName ?? 'Caller'}`
    }

    const agent = `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`

    const minutes = Math.floor((c.talk_time ?? 0) / 60)
    const seconds = (c.talk_time ?? 0) % 60

    return `${user} ${
        isVoicemail
            ? ` left a voicemail`
            : ` talked to ${agent} for ${minutes}m ${seconds}s`
    } `
}

export const generateCallerId = (
    attributes: Record<string, any>
): { name: string; phoneNumber?: string } => {
    if (attributes.direction === Direction.Outbound) {
        const { isValid, formattedNumber } = parsePhoneNumber(attributes.name)

        if (!isValid)
            return {
                name: attributes.name,
                phoneNumber: parsePhoneNumber(attributes.outbound_to)
                    .formattedNumber,
            }

        return {
            name: formattedNumber!,
        }
    } else {
        const { isValid, formattedNumber } = parsePhoneNumber(attributes.name)

        if (!isValid)
            return { name: attributes.name, phoneNumber: formattedNumber }

        return {
            name: formattedNumber!,
        }
    }
}
