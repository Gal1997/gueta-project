const GIS_SRC = "https://accounts.google.com/gsi/client";
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export const isGoogleConfigured = Boolean(CLIENT_ID);

let scriptPromise: Promise<void> | null = null;

function loadGisScript(): Promise<void> {
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = GIS_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("טעינת שירותי הזהות של Google נכשלה."));
    document.head.appendChild(script);
  });

  return scriptPromise;
}

/**
 * Opens the Google sign-in popup and resolves with an OAuth access token,
 * which the backend exchanges for the user's profile.
 */
export async function requestGoogleAccessToken(): Promise<string> {
  if (!CLIENT_ID) {
    throw new Error("התחברות עם Google אינה מוגדרת.");
  }

  await loadGisScript();

  return new Promise<string>((resolve, reject) => {
    const client = window.google!.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: "openid email profile",
      callback: (response) => {
        if (response.error) {
          reject(new Error(response.error_description ?? response.error));
          return;
        }
        resolve(response.access_token);
      },
      error_callback: (error) =>
        reject(new Error(error.message ?? "ההתחברות עם Google בוטלה.")),
    });

    client.requestAccessToken();
  });
}
