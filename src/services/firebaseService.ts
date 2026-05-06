import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const firebaseService = {
  /**
   * Request permission and get FCM token
   */
  requestNotificationPermission: async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const token = await getToken(messaging, {
          vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
        });
        if (token) {
          console.log('FCM Token:', token);
          // In a real app, send this token to your server
          localStorage.setItem('sada_fcm_token', token);
          return token;
        }
      }
    } catch (error) {
      console.error('Notification permission error:', error);
    }
    return null;
  },

  /**
   * Listen for foreground messages
   */
  onForegroundMessage: (callback: (payload: any) => void) => {
    return onMessage(messaging, (payload) => {
      console.log('New foreground message:', payload);
      callback(payload);
    });
  },

  /**
   * Schedule a mock notification (for hackathon demo)
   */
  scheduleSpacedRepetition: (_verseKey: string, _feeling: string) => {
    // In a real app, this would be handled by a backend
    console.log(`Scheduling reflection reminder for ${_verseKey} in 3 days...`);
    
    // For demo purposes, we can use a simple setTimeout if the app stays open (not ideal)
  }
};
