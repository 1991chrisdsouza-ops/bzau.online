/* Handle standard Web Push messages for iPhone and iPad. */
self.addEventListener("push", function (event) {
  if (!event.data) return;

  let payload;

  try {
    payload = event.data.json();
  } catch (error) {
    return;
  }

  /*
   * Firebase messages are handled by Firebase below.
   * Only handle our Apple-compatible messages here.
   */
  if (payload.source !== "bzau-webpush") return;

  const title = payload.title || "BZau Bonus";

  const options = {
    body: payload.body || "Your special offer is waiting!",
    icon: "/images/bz-logo-symbol.png",
    badge: "/images/bz-logo-symbol.png",
    data: {
      link: payload.link || "https://www.bzau.site/"
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

/* Open the correct link when any notification is clicked. */
self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  const firebaseMessage = event.notification.data?.FCM_MSG;

  const targetUrl =
    event.notification.data?.link ||
    firebaseMessage?.data?.link ||
    "https://www.bzau.site/";

  event.waitUntil(
    clients.openWindow(targetUrl)
  );
});

/* Firebase support for Chrome, Edge and Firefox. */
try {
  importScripts(
    "https://www.gstatic.com/firebasejs/12.18.0/firebase-app-compat.js"
  );

  importScripts(
    "https://www.gstatic.com/firebasejs/12.18.0/firebase-messaging-compat.js"
  );

  firebase.initializeApp({
    apiKey: "AIzaSyCJVt6VVHYLmn7U2LbnXWEmWDIM3yH00oM",
    authDomain: "bzau-push-huff-notification.firebaseapp.com",
    projectId: "bzau-push-huff-notification",
    storageBucket:
      "bzau-push-huff-notification.firebasestorage.app",
    messagingSenderId: "652170896577",
    appId:
      "1:652170896577:web:db679e9f78f477a82b2040"
  });

  firebase.messaging();
} catch (error) {
  console.log("Firebase Messaging is unavailable on this browser.");
}