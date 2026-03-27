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
  private scriptPromise: Promise<void> | null = null;
  private pendingResolve: ((value: { user: GoogleUser; idToken: string }) => void) | null = null;
  private pendingReject: ((reason: Error) => void) | null = null;

  private handleCredentialResponse = (response: any) => {
    if (!this.pendingResolve || !this.pendingReject) return;
    const resolve = this.pendingResolve;
    const reject = this.pendingReject;
    this.pendingResolve = null;
    this.pendingReject = null;

    try {
      if (!response?.credential) throw new Error("No Google credential received.");
      const tokenParts = response.credential.split(".");
      if (tokenParts.length !== 3) throw new Error("Invalid Google credential format.");
      const payload = JSON.parse(atob(tokenParts[1].replace(/-/g, "+").replace(/_/g, "/")));
      resolve({
        user: { id: payload.sub, email: payload.email, name: payload.name, picture: payload.picture },
        idToken: response.credential,
      });
    } catch (error: any) {
      reject(error);
    }
  };

  async init(clientId: string) {
    if (this.initialized && this.clientId === clientId && typeof window !== "undefined" && window.google) {
      return;
    }

    this.clientId = clientId;

    if (typeof window === "undefined") {
      throw new Error("Google sign-in is only available in the browser.");
    }

    if (!window.google) {
      if (!this.scriptPromise) {
        this.scriptPromise = new Promise<void>((resolve, reject) => {
          const existing = document.querySelector('script[data-google-auth="1"]');
          if (existing) {
            existing.addEventListener("load", () => resolve(), { once: true });
            existing.addEventListener("error", () => reject(new Error("Failed to load Google SDK")), { once: true });
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
      }
      await this.scriptPromise;
    }

    if (!window.google) throw new Error("Google SDK loaded but Google sign-in is unavailable.");

    // initialize() called ONCE here, not on every sign-in
    window.google.accounts.id.initialize({
      client_id: this.clientId,
      callback: this.handleCredentialResponse,
    });

    this.initialized = true;
  }

  isInitialized() {
    return this.initialized && typeof window !== "undefined" && Boolean(window.google);
  }

  async signIn(): Promise<{ user: GoogleUser; idToken: string }> {
    if (!this.isInitialized() || !window.google) {
      throw new Error("Google sign-in is not ready yet.");
    }

    // Cancel any in-flight sign-in before starting a new one
    if (this.pendingReject) {
      this.pendingReject(new Error("Sign-in cancelled by new request."));
      this.pendingResolve = null;
      this.pendingReject = null;
    }

    return new Promise((resolve, reject) => {
      const timeout = window.setTimeout(() => {
        if (this.pendingReject === reject) {
          this.pendingResolve = null;
          this.pendingReject = null;
          reject(new Error("Google sign-in timed out. Please try again."));
        }
      }, 15000);

      this.pendingResolve = (value) => { window.clearTimeout(timeout); resolve(value); };
      this.pendingReject = (err) => { window.clearTimeout(timeout); reject(err); };

      window.google.accounts.id.prompt((notification: any) => {
        if (notification?.isNotDisplayed?.() || notification?.isSkippedMoment?.()) {
          if (this.pendingReject) {
            const r = this.pendingReject;
            this.pendingResolve = null;
            this.pendingReject = null;
            r(new Error("Google sign-in is unavailable on this device right now."));
          }
        }
      });
    });
  }
}

export const googleAuth = new GoogleAuthService();
