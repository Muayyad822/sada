importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyD2OMYOQTkI5z825ueJ3cNCP5KwtXrHGnU",
  authDomain: "sada-a8c01.firebaseapp.com",
  projectId: "sada-a8c01",
  storageBucket: "sada-a8c01.firebasestorage.app",
  messagingSenderId: "1073450560703",
  appId: "1:1073450560703:web:0e792b3aa64bce22bb2a0a"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
