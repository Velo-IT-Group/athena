import {
    Context,
    ServerlessCallback,
    ServerlessEventObject,
    ServerlessFunctionSignature,
} from "@twilio-labs/serverless-runtime-types/types";
import { TaskInstance } from "twilio/lib/rest/taskrouter/v1/workspace/task";
import { MyContext } from "./callback";

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
    urlencoded.append("TaskQueueSid", "WQ54b5a1ea6521d9ae425bf421e407810f");
    urlencoded.append("Attributes", JSON.stringify(event));
    urlencoded.append("WorkflowSid", "WW5eb5a86b4c1603593ab18da34115b7dc");

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: urlencoded,
    };

    try {
        const res = await fetch(
            `https://taskrouter.twilio.com/v1/Workspaces/${context.TWILIO_WORKSPACE_SID}/Tasks`,
            requestOptions,
        );

        const task = (await res.json()) as TaskInstance;

        console.log("Task created: ", task);

        const dial = response.dial();

        dial.conference(
            {
                // beep: "true",
                startConferenceOnEnter: true,
                endConferenceOnExit: true,
                waitUrl: "",
                // statusCallback: "/conference/status-callback",
                // statusCallbackEvent: ["start", "join", "end"],
                // statusCallbackMethod: "POST",

                // eventCallbackUrl: "http://localhost:3001/conference/status-callback",
                // recordingStatusCallback:
                //     "https://qqfkxhqzsbqgydssvfss.supabase.co/functions/v1/process-recording",
                // recordingStatusCallbackEvent: ["completed"],
                participantLabel: "worker",
                // @ts-ignore
                earlyMedia: true,
            },
            task.sid,
        );

        const conferenceStatusCallback = `${
            context.DOMAIN_NAME.includes("localhost") ? "http" : "https"
        }://${context.DOMAIN_NAME}/conference/status-callback`;

        const participant = await client.conferences(task.sid).participants
            .create({
                from: event.from ?? "",
                to: event.to ?? "",
                beep: "true",
                record: true,
                earlyMedia: true,
                conferenceRecord: "record-from-start",
                startConferenceOnEnter: true,
                endConferenceOnExit: true,
                label: "customer",
                conferenceStatusCallback,
                conferenceStatusCallbackEvent: ["end"],
                conferenceStatusCallbackMethod: "POST",
                // eventCallbackUrl:
                //     "http://localhost:3001/conference/status-callback",
                // endConferenceOnCustomerExit: true,
                // transcribe: true,
                // transcriptionConfiguration: 'Athena',
                waitUrl: "",
            });

        await client.taskrouter.v1
            .workspaces(context.TWILIO_WORKSPACE_SID!)
            .tasks(task.sid)
            .update({
                attributes: JSON.stringify({
                    ...JSON.parse(task.attributes),
                    conference: {
                        sid: participant.conferenceSid,
                        participants: {
                            worker: event?.CallSid,
                            customer: participant?.callSid,
                        },
                    },
                }),
            });
        return callback(null, response);
    } catch (error) {
        console.error(
            "Error creating conference participant:",
            (error as Error).message,
        );
        return callback(error as Error, undefined);
    }
};
