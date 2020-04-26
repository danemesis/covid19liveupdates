import * as firebase from 'firebase/app';

export const initFirebase = ({
    FIREBASE_API_KEY,
    FIREBASE_AUTHDOMAIN,
    FIREBASE_DATABASE_URL,
    FIREBASE_PROJECT_ID,
    FIREBASE_STORAGE_BUCKET,
    FIREBASE_MESSAGING_SENDER_ID,
    FIREBASE_APP_ID,
}): [Error, firebase.app.App | null] => {
    try {
        const firebaseApp: firebase.app.App = firebase.initializeApp({
            apiKey: FIREBASE_API_KEY,
            authDomain: FIREBASE_AUTHDOMAIN,
            databaseURL: FIREBASE_DATABASE_URL,
            projectId: FIREBASE_PROJECT_ID,
            storageBucket: FIREBASE_STORAGE_BUCKET,
            messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
            appId: FIREBASE_APP_ID,
        });
        return [null, firebaseApp];
    } catch (e) {
        return [e, null];
    }
};
