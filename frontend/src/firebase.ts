import { env } from "@/lib/utils";
import { FirebaseOptions, getApp, getApps, initializeApp } from "firebase/app";
import { getMessaging, getToken, isSupported } from "firebase/messaging";

// Replace the following with your app's Firebase project configuration
const firebaseConfig: FirebaseOptions = {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: "athena-49cf1.firebaseapp.com",
    projectId: "athena-49cf1",
    storageBucket: "athena-49cf1.firebasestorage.app",
    messagingSenderId: "76304911110",
    appId: "1:76304911110:web:79eb7e0dded3dda7eaec87",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const messaging = async () => {
    const supported = await isSupported();
    return supported ? getMessaging(app) : null;
};

export const fetchToken = async () => {
    try {
        const fcmMessaging = await messaging();
        if (fcmMessaging) {
            const token = await getToken(fcmMessaging, {
                vapidKey: env.VITE_FIREBASE_FCM_VAPID_KEY,
            });
            return token;
        }
        return null;
    } catch (err) {
        console.error("An error occurred while fetching the token:", err);
        return null;
    }
};

export { app, messaging };
