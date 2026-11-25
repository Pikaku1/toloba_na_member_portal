self.addEventListener("push", (event) => {
  let payload = { title: "Toloba NA", body: "", url: "/announcements" };
  try {
    const data = event.data ? event.data.json() : null;
    if (data && typeof data === "object") {
      if (typeof data.title === "string" && data.title.trim()) payload.title = data.title;
      if (typeof data.body === "string") payload.body = data.body;
      if (typeof data.url === "string" && data.url.startsWith("/") && !data.url.startsWith("//")) {
        payload.url = data.url;
      }
    }
  } catch {
    payload.body = event.data ? event.data.text() : "";
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/pwa-192x192.png",
      badge: "/favicon-32.png",
      data: { url: payload.url },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target =
    event.notification.data && typeof event.notification.data.url === "string"
      ? event.notification.data.url
      : "/announcements";
  const url = new URL(target, self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      for (const client of windows) {
        if (!client.url.startsWith(self.location.origin)) continue;
        if ("navigate" in client && typeof client.navigate === "function") {
          return client.navigate(url).then((next) => next && next.focus());
        }
        return client.focus();
      }
      return self.clients.openWindow(url);
    }),
  );
});
