import { Contact } from '@/types/manage'
import { relativeDate } from '@/utils/date'
import React from 'react'

interface Props {
    conversation: Conversation
    profiles: Profile[]
    contacts: Contact[]
}

const ConversationItem = ({ conversation, profiles, contacts }: Props) => {
    const profile = profiles?.find((p) => conversation.agent === p.worker_sid)

    let user = ''
    // if (contactId) {
    //     user = `${contact?.firstName} ${contact?.lastName}`
    // } else {
    //     const contact = contacts?.find((contact) => {
    //         return contact.id === conversation.contact_id
    //     })

    //     user = `${contact?.firstName ?? 'Unknown'} ${contact?.lastName ?? 'Caller'}`
    // }
    const contact = contacts?.find((contact) => {
        return contact.id === conversation.contact_id
    })

    user = `${contact?.firstName ?? 'Unknown'} ${contact?.lastName ?? 'Caller'}`

    const agent = `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`

    const minutes = Math.floor((conversation.talk_time ?? 0) / 60)
    const seconds = (conversation.talk_time ?? 0) % 60

    const isVoicemail = conversation.workflow === 'Voicemail'

    return (
        <li className="relative flex gap-4 group">
            <div className="absolute top-0 -bottom-6 left-0 flex w-6 justify-center">
                <div className="w-[1px] group-last:hidden bg-muted-foreground" />
            </div>
            <div className="relative flex size-6 flex-none items-center justify-center bg-background">
                <div className="size-1.5 rounded-full bg-muted-foreground"></div>
            </div>
            <p className="flex-auto py-0.5 text-xs text-muted-foreground leading-5">
                <span className="text-foreground font-medium">{user}</span>

                {isVoicemail ? (
                    <span> left a voicemail</span>
                ) : (
                    <span>
                        {' '}
                        talked to{' '}
                        <span className="text-foreground font-medium">
                            {agent}
                        </span>{' '}
                        for {minutes}m {seconds}s
                    </span>
                )}
            </p>
            <time
                dateTime={conversation.date}
                className="flex-none px-0.5 text-xs text-muted-foreground"
            >
                {conversation.date && relativeDate(new Date(conversation.date))}
            </time>
        </li>
    )
}

export default ConversationItem
