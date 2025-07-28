import {
    Context,
    ServerlessCallback,
    ServerlessEventObject,
    ServerlessFunctionSignature,
} from "@twilio-labs/serverless-runtime-types/types";
import { MyContext } from "./callback";
import { TaskInstance } from "twilio/lib/rest/taskrouter/v1/workspace/task";

type MyEvent = {
    territoryName?: string;
    ApiVersion?: string;
    Called?: string;
    workerSid?: string;
    channel?: string;
    CallStatus?: string;
    From?: string;
    Direction?: string;
    userId?: string;
    AccountSid?: string;
    ApplicationSid?: string;
    companyId?: string;
    Caller?: string;
    name?: string;
    from?: string;
    CallSid?: string;
    To?: string;
    to?: string;
    direction?: string;
    worker_sid?: string;
    worker_name?: string;
};

export const handler: ServerlessFunctionSignature = async function (
    context: Context<MyContext>,
    event: ServerlessEventObject<MyEvent>,
    callback: ServerlessCallback,
) {
    console.log(event);
    // Here's an example of setting up some TWiML to respond to with this function
    const client = context.getTwilioClient();
    const response = new Twilio.twiml.VoiceResponse();

    // @ts-ignore
    delete event.request;

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
    myHeaders.append(
        "Authorization",
        "Basic " + btoa(`${context.ACCOUNT_SID}:${context.AUTH_TOKEN}`),
    );

    const urlencoded = new URLSearchParams();
    urlencoded.append("RoutingTarget", event.workerSid ?? "");
    urlencoded.append("TaskQueueSid", "WQ3c90735094691877cdfc293bba42a06e");
    urlencoded.append("Attributes", JSON.stringify(event));

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: urlencoded,
    };

    const res = await fetch(
        `https://taskrouter.twilio.com/v1/Workspaces/${context.TWILIO_WORKSPACE_SID}/Tasks`,
        requestOptions,
    );

    const task = await res.json() as TaskInstance;

    const dial = response.dial();
    dial.conference({
        // beep: "true",
        startConferenceOnEnter: true,
        endConferenceOnExit: true,
        waitUrl: "",
        statusCallback:
            "https://fd2ff4ac20d4.ngrok-free.app/conference/status-callback",
        statusCallbackEvent: ["start", "join", "end"],
        statusCallbackMethod: "POST",
        // eventCallbackUrl: "http://localhost:3001/conference/status-callback",
        // recordingStatusCallback:
        //     "https://qqfkxhqzsbqgydssvfss.supabase.co/functions/v1/process-recording",
        // recordingStatusCallbackEvent: ["completed"],
        participantLabel: "worker",
        // @ts-ignore
        earlyMedia: true,
    }, task.sid);

    const participant = await client
        .conferences(task.sid)
        .participants.create({
            from: event.from ?? "",
            to: event.to ?? "",
            beep: "true",
            // record: true,
            earlyMedia: true,
            // conferenceRecord: "record-from-start",
            startConferenceOnEnter: true,
            endConferenceOnExit: true,
            label: "customer",
            conferenceStatusCallback:
                "https://fd2ff4ac20d4.ngrok-free.app/conference/status-callback",
            conferenceStatusCallbackEvent: ["end"],
            conferenceStatusCallbackMethod: "POST",
            // eventCallbackUrl:
            //     "http://localhost:3001/conference/status-callback",

            // endConferenceOnCustomerExit: true,
            // transcribe: true,
            // transcriptionConfiguration: 'Athena',
            waitUrl: "",
        });

    try {
        await client.taskrouter.v1.workspaces(
            context.TWILIO_WORKSPACE_SID!,
        )
            .tasks(task.sid)
            .update({
                attributes: JSON.stringify({
                    ...JSON.parse(task.attributes),
                    conference: {
                        sid: participant.conferenceSid,
                        participants: {
                            worker: event.CallSid,
                            customer: participant.callSid,
                        },
                    },
                }),
            });

        // console.log(
        //     "Task updated with conference details:",
        //     newTask.attributes,
        // );
    } catch (error) {
        console.error("Error updating task with conference details:", error);
    }

    return callback(null, response);
};
