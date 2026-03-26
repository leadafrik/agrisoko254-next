declare global {
  interface Window {
    google?: any;
  }
}

type GoogleUser = {
  id: string;
  email: string;
  name: string;
  picture?: string;
};

class GoogleAuthService {
  private initialized = false;
  private clientId = "";

  async init(clientId: string) {
    if (this.initialized && typeof window !== "undefined" && window.google) {
      return;
    }

    this.clientId = clientId;

    if (typeof window === "undefined") {
      throw new Error("Google sign-in is only available in the browser.");
    }

    if (window.google) {
      window.google.accounts.id.initialize({ client_id: clientId });
      this.initialized = true;
      return;
    }

    await new Promise<void>((resolve, reject) => {
      const existing = document.querySelector('script[data-google-auth="1"]');
      if (existing) {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => reject(new Error("Failed to load Google SDK")), {
          once: true,
        });
        return;
      }

      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.dataset.googleAuth = "1";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Google SDK"));
      document.head.appendChild(script);
    });

    if (!window.google) {
      throw new Error("Google SDK loaded but Google sign-in is unavailable.");
    }

    window.google.accounts.id.initialize({ client_id: clientId });
    this.initialized = true;
  }

  isInitialized() {
    return this.initialized && typeof window !== "undefined" && Boolean(window.google);
  }

  async signIn(): Promise<{ user: GoogleUser; idToken: string }> {
    if (!this.isInitialized() || !window.google) {
      throw new Error("Google sign-in is not ready yet.");
    }

    return new Promise((resolve, reject) => {
      let settled = false;
      const timeout = window.setTimeout(() => {
        if (!settled) {
          settled = true;
          reject(new Error("Google sign-in timed out. Please try again."));
        }
      }, 15000);

      window.google.accounts.id.initialize({
        client_id: this.clientId,
        callback: (response: any) => {
          try {
            if (!response?.credential) {
              throw new Error("No Google credential received.");
            }

            const tokenParts = response.credential.split(".");
            if (tokenParts.length !== 3) {
              throw new Error("Invalid Google credential format.");
            }

            const payload = JSON.parse(atob(tokenParts[1].replace(/-/g, "+").replace(/_/g, "/")));
            const user: GoogleUser = {
              id: payload.sub,
              email: payload.email,
              name: payload.name,
              picture: payload.picture,
            };

            if (!settled) {
              settled = true;
              window.clearTimeout(timeout);
              resolve({ user, idToken: response.credential });
            }
          } catch (error) {
            if (!settled) {
              settled = true;
              window.clearTimeout(timeout);
              reject(error);
            }
          }
        },
      });

      window.google.accounts.id.prompt((notification: any) => {
        if (!settled && (notification?.isNotDisplayed?.() || notification?.isSkippedMoment?.())) {
          settled = true;
          window.clearTimeout(timeout);
          reject(new Error("Google sign-in is unavailable on this device right now."));
        }
      });
    });
  }
}

export const googleAuth = new GoogleAuthService();
