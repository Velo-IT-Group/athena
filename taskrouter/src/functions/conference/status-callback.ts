import {
    Context,
    ServerlessCallback,
    ServerlessEventObject,
    ServerlessFunctionSignature,
} from "@twilio-labs/serverless-runtime-types/types";
import { MyContext } from "../callback";

type MyEvent = {
    ConferenceSid?: string;
    FriendlyName?: string;
    AccountSid?: string;
    SequenceNumber?: string;
    Timestamp?: string;
    StatusCallbackEvent?: string;
    CallSid?: string;
    Muted?: string;
    Hold?: string;
    Coaching?: string;
    EndConferenceOnExit?: string;
    StartConferenceOnEnter?: string;
    CallSidEndingConference?: string;
    ParticipantLabelEndingConference?: string;
    ReasonConferenceEnded?: string;
    Reason?: string;
    ReasonAnnouncementFailed?: string;
    AnnounceUrl?: string;
    ParticipantCallStatus?: string;
    ReasonParticipantLeft?: string;
    EventName?: string;
    RecordingUrl?: string;
    Duration?: string;
    RecordingFileSize?: string;
    WorkerSid?: string;
};

export const handler: ServerlessFunctionSignature = async function (
    context: Context<MyContext>,
    event: ServerlessEventObject<MyEvent>,
    callback: ServerlessCallback,
) {
    // console.log("CONFERENCE STATUS EVENT: ", event);
    // Here's an example of setting up some TWiML to respond to with this function
    const client = context.getTwilioClient();
    const response = new Twilio.twiml.VoiceResponse();
    const taskContext = client.taskrouter.v1.workspaces(
        context.TWILIO_WORKSPACE_SID!,
    ).tasks(event.FriendlyName ?? "");

    if (event.StatusCallbackEvent === "conference-end") {
        const task = await taskContext.fetch();
        const reservations = await taskContext.reservations.list();
        await reservations.find((r) =>
            r.workerSid === JSON.parse(task.attributes).workerSid
        )?.update(
            {
                reservationStatus: "wrapping",
            },
        );
    }

    return callback(null, response);
};
