import React, { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { makeFunctionReference } from "convex/server";

const publicKeyQuery = makeFunctionReference<"query", Record<string, never>, string | null>(
  "push:publicKey",
);

const saveSubscription = makeFunctionReference<
  "mutation",
  { endpoint: string; p256dh: string; auth: string },
  null
>("push:saveSubscription");

const removeSubscription = makeFunctionReference<"mutation", { endpoint: string }, null>(
  "push:removeSubscription",
);

type Support = "unknown" | "ready" | "unsupported" | "install";

function iosDevice() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

function standaloneApp() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator &&
      (navigator as Navigator & { standalone?: boolean }).standalone === true)
  );
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) output[i] = raw.charCodeAt(i);
  return output;
}

function messageFrom(err: unknown) {
  const raw =
    err && typeof err === "object" && "data" in err && typeof err.data === "string"
      ? err.data
      : err instanceof Error && err.message
        ? err.message
        : "Notifications could not be turned on.";
  if (/push service not available/i.test(raw)) {
    return "This browser cannot deliver notifications. Open Toloba in Chrome, or from the home-screen icon.";
  }
  return raw;
}

const NotificationSection: React.FC = () => {
  const applicationKey = useQuery(publicKeyQuery, {});
  const save = useMutation(saveSubscription);
  const remove = useMutation(removeSubscription);
  const [support, setSupport] = useState<Support>("unknown");
  const [permission, setPermission] = useState<NotificationPermission | "unknown">("unknown");
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
      setSupport("unsupported");
      return;
    }
    if (iosDevice() && !standaloneApp()) {
      setSupport("install");
      return;
    }
    setSupport("ready");
    setPermission(Notification.permission);
    let cancelled = false;
    navigator.serviceWorker.ready
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) => {
        if (!cancelled) setSubscribed(Boolean(subscription));
      })
      .catch(() => {
        if (!cancelled) setSupport("unsupported");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const turnOn = async () => {
    if (!applicationKey) return;
    setBusy(true);
    setError(null);
    try {
      const next = await Notification.requestPermission();
      setPermission(next);
      if (next !== "granted") return;

      const registration = await navigator.serviceWorker.ready;
      const existing = await registration.pushManager.getSubscription();
      const subscription =
        existing ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(applicationKey),
        }));
      const json = subscription.toJSON();
      if (!json.endpoint || !json.keys?.p256dh || !json.keys.auth) {
        throw new Error("This phone did not finish turning notifications on.");
      }
      await save({
        endpoint: json.endpoint,
        p256dh: json.keys.p256dh,
        auth: json.keys.auth,
      });
      setSubscribed(true);
    } catch (err) {
      setError(messageFrom(err));
    } finally {
      setBusy(false);
    }
  };

  const turnOff = async () => {
    setBusy(true);
    setError(null);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        const endpoint = subscription.endpoint;
        await subscription.unsubscribe();
        await remove({ endpoint });
      }
      setSubscribed(false);
    } catch (err) {
      setError(messageFrom(err));
    } finally {
      setBusy(false);
    }
  };

  const on = subscribed && permission === "granted";
  const blocked = permission === "denied";

  return (
    <section className="card notifications-card">
      <div className="profile-row">
        <span>Notifications</span>
        <strong>{on ? "On" : blocked ? "Blocked" : "Off"}</strong>
      </div>
      <p className="notifications-note">
        New announcements and surveys, and transfers that involve you.
      </p>
      {support === "install" && (
        <p className="notifications-note">
          Add Toloba to your Home Screen, then open it from that icon to turn notifications on.
        </p>
      )}
      {support === "unsupported" && (
        <p className="notifications-note">This browser cannot show notifications.</p>
      )}
      {blocked && (
        <p className="notifications-note">
          Notifications are blocked. Allow them for Toloba in your phone settings.
        </p>
      )}
      {applicationKey === null && support === "ready" && (
        <p className="notifications-note">Notifications are not available on this account yet.</p>
      )}
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
      {support === "ready" && !blocked && applicationKey && !on && (
        <button type="button" className="btn btn-navy" disabled={busy} onClick={turnOn}>
          {busy ? "Turning on…" : "Turn on notifications"}
        </button>
      )}
      {support === "ready" && on && (
        <button type="button" className="btn btn-ghost notifications-off" disabled={busy} onClick={turnOff}>
          {busy ? "Turning off…" : "Turn off notifications"}
        </button>
      )}
      <style>{`
        .notifications-card {
          margin-top: 16px;
          padding: 4px 16px 16px;
        }

        .notifications-note {
          margin: 0 0 12px;
          color: var(--ink-secondary);
          font-size: 14px;
          line-height: 1.45;
        }

        .notifications-off {
          margin-top: 4px;
        }
      `}</style>
    </section>
  );
};

export default NotificationSection;
