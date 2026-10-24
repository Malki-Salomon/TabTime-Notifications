import { useCallback } from "react";
import { useSelector } from "react-redux";
import { selectEmail, selectUser, selectToken } from "../features/auth/authSlice";
import { useUpdateUserByEmailMutation } from "../features/apiSlice";

// Convert a URL-safe base64 VAPID key to Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) out[i] = raw.charCodeAt(i);
  return out;
}

// ArrayBuffer -> base64 string
function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin);
}

export async function getPushTokens() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    throw new Error("Push notifications are not supported in this browser");
  }
  const permission = await Notification.requestPermission();
  if (permission !== "granted") throw new Error("Permission denied");

  const registration = await navigator.serviceWorker.ready;
  const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    ...(vapidKey ? { applicationServerKey: urlBase64ToUint8Array(vapidKey) } : {}),
  });

  const p256dh = subscription.getKey("p256dh");
  const auth = subscription.getKey("auth");
  return {
    pushEndpoint: subscription.endpoint,
    pushP256dh: p256dh ? arrayBufferToBase64(p256dh) : null,
    pushAuth: auth ? arrayBufferToBase64(auth) : null,
  };
}

export function useNotification() {
  const email = useSelector(selectEmail);
  const user = useSelector(selectUser);
  const token = useSelector(selectToken);
  const [updateUser] = useUpdateUserByEmailMutation();

  const subscribe = useCallback(async () => {
    if (!email || !user || !token) throw new Error("User not authenticated");
    const tokens = await getPushTokens();
    const body = { ...user, ...tokens };
    await updateUser({ email, body }).unwrap();
    return tokens;
  }, [email, user, token, updateUser]);

  return { subscribe };
}
