import { updateConference } from '@/lib/twilio/conference/helpers'
import { ConferenceContextUpdateOptions } from 'twilio/lib/rest/api/v2010/account/conference'

export const updateConferenceAction = async (
    conferenceSid: string,
    params: ConferenceContextUpdateOptions
) => {
    await updateConference(conferenceSid, params)
}
