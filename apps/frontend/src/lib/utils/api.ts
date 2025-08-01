import { queryOptions, useMutation } from "@tanstack/react-query";
import { useTwilio } from "@/contexts/twilio-provider";
import {
    MICROPHONE_DEVICE_ID_LOCAL_STORAGE_KEY,
    SPEAKER_DEVICE_ID_LOCAL_STORAGE_KEY,
} from "@/utils/constants";

export const getMediaDevicesQuery = () =>
    queryOptions({
        queryKey: ["audio-devices", navigator],
        queryFn: async () => {
            if (typeof navigator === "undefined") return;
            await navigator.mediaDevices.getUserMedia({
                audio: true,
            });

            return await navigator.mediaDevices.enumerateDevices();
        },
        select(data) {
            const defaultInputId = localStorage.getItem(
                MICROPHONE_DEVICE_ID_LOCAL_STORAGE_KEY,
            );
            const defaultOutputId = localStorage.getItem(
                SPEAKER_DEVICE_ID_LOCAL_STORAGE_KEY,
            );
            const inputDevices = data?.filter(
                (device) =>
                    device.kind === "audioinput" &&
                    !device.label.toLocaleLowerCase().includes("default"),
            ) ?? [];

            const outputDevices = data?.filter(
                (device) =>
                    device.kind === "audiooutput" &&
                    !device.label.toLocaleLowerCase().includes("default"),
            ) ?? [];

            return {
                inputDevices,
                outputDevices,
                defaultInput: defaultInputId
                    ? data?.find(
                        (device) =>
                            device.kind === "audioinput" &&
                            device.label === defaultInputId,
                    )
                    : data?.find(
                        (device) =>
                            device.kind === "audioinput" &&
                            device.label.toLocaleLowerCase().includes(
                                "default",
                            ),
                    ) ?? null,
                defaultOutput: defaultOutputId
                    ? data?.find(
                        (device) =>
                            device.kind === "audiooutput" &&
                            device.label === defaultOutputId,
                    ) ?? null
                    : data?.find(
                        (device) =>
                            device.kind === "audiooutput" &&
                            device.label.toLocaleLowerCase().includes(
                                "default",
                            ),
                    ) ?? null,
            };
        },
        // throwOnError: true,
    });

export const changeInputDevice = () => {
    const { device } = useTwilio();

    return useMutation({
        mutationFn: async (item: MediaDeviceInfo) => {
            return await device?.audio?.setInputDevice(
                item.deviceId,
            );
        },
        onSuccess: (_, item) => {
            localStorage.setItem(
                MICROPHONE_DEVICE_ID_LOCAL_STORAGE_KEY,
                item.label,
            );
        },
    });
};
export const changeOutputDevice = () => {
    const { device } = useTwilio();

    return useMutation({
        mutationFn: async (item: MediaDeviceInfo) => {
            return await device?.audio?.speakerDevices.set(
                item.deviceId,
            );
        },
        onSuccess: async (_, item) => {
            await device?.audio?.speakerDevices.test();

            localStorage.setItem(
                SPEAKER_DEVICE_ID_LOCAL_STORAGE_KEY,
                item.label,
            );
        },
    });
};
