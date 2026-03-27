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

type GoogleCredential = {
  user: GoogleUser;
  idToken: string;
};

type GoogleCredentialHandlers = {
  onSuccess: (credential: GoogleCredential) => void;
  onError?: (error: Error) => void;
};

type GoogleButtonOptions = {
  theme?: "outline" | "filled_blue" | "filled_black";
  text?: "continue_with" | "signin_with" | "signup_with";
  shape?: "rectangular" | "pill";
  width?: number;
};

class GoogleAuthService {
  private initialized = false;
  private clientId = "";
  private scriptPromise: Promise<void> | null = null;
  private handlers: GoogleCredentialHandlers | null = null;

  private decodePayload(segment: string) {
    const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");

    return JSON.parse(
      decodeURIComponent(
        atob(padded)
          .split("")
          .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`)
          .join("")
      )
    );
  }

  private parseCredential(response: any): GoogleCredential {
    if (!response?.credential) throw new Error("No Google credential received.");
    const tokenParts = response.credential.split(".");
    if (tokenParts.length !== 3) throw new Error("Invalid Google credential format.");

    const payload = this.decodePayload(tokenParts[1]);

    return {
      user: {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
      },
      idToken: response.credential,
    };
  }

  private handleCredentialResponse = (response: any) => {
    if (!this.handlers) return;

    try {
      this.handlers.onSuccess(this.parseCredential(response));
    } catch (error: any) {
      this.handlers.onError?.(
        error instanceof Error ? error : new Error("Google sign-in failed.")
      );
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

    window.google.accounts.id.initialize({
      client_id: this.clientId,
      callback: this.handleCredentialResponse,
    });

    this.initialized = true;
  }

  isInitialized() {
    return this.initialized && typeof window !== "undefined" && Boolean(window.google);
  }

  clearHandlers() {
    this.handlers = null;
  }

  renderButton(
    container: HTMLElement,
    handlers: GoogleCredentialHandlers,
    options: GoogleButtonOptions = {}
  ) {
    if (!this.isInitialized() || !window.google) {
      throw new Error("Google sign-in is not ready yet.");
    }

    this.handlers = handlers;
    container.innerHTML = "";

    const width =
      options.width ??
      Math.max(Math.round(container.getBoundingClientRect().width) || 0, 280);

    window.google.accounts.id.renderButton(container, {
      type: "standard",
      theme: options.theme ?? "outline",
      size: "large",
      shape: options.shape ?? "pill",
      text: options.text ?? "continue_with",
      logo_alignment: "left",
      width,
    });
  }
}

export const googleAuth = new GoogleAuthService();
