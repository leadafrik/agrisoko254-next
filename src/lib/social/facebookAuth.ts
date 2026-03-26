declare global {
  interface Window {
    FB?: any;
    fbAsyncInit?: () => void;
  }
}

type FacebookUser = {
  id: string;
  email: string;
  name: string;
  picture?: string;
};

class FacebookAuthService {
  private initialized = false;
  private appId = "";

  async init(appId: string) {
    if (this.initialized && typeof window !== "undefined" && window.FB) {
      return;
    }

    this.appId = appId;

    if (typeof window === "undefined") {
      throw new Error("Facebook login is only available in the browser.");
    }

    if (window.FB) {
      window.FB.init({
        appId,
        cookie: true,
        xfbml: false,
        version: "v18.0",
      });
      this.initialized = true;
      return;
    }

    await new Promise<void>((resolve, reject) => {
      window.fbAsyncInit = () => {
        try {
          if (!window.FB) {
            throw new Error("Facebook SDK missing after load.");
          }

          window.FB.init({
            appId,
            cookie: true,
            xfbml: false,
            version: "v18.0",
          });

          resolve();
        } catch (error) {
          reject(error);
        }
      };

      const existing = document.querySelector('script[data-facebook-auth="1"]');
      if (existing) {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => reject(new Error("Failed to load Facebook SDK")), {
          once: true,
        });
        return;
      }

      const script = document.createElement("script");
      script.src = "https://connect.facebook.net/en_US/sdk.js";
      script.async = true;
      script.defer = true;
      script.dataset.facebookAuth = "1";
      script.onload = () => {
        if (window.FB) {
          resolve();
        }
      };
      script.onerror = () => reject(new Error("Failed to load Facebook SDK"));
      document.head.appendChild(script);
    });

    this.initialized = true;
  }

  isInitialized() {
    return this.initialized && typeof window !== "undefined" && Boolean(window.FB);
  }

  async login(): Promise<{ user: FacebookUser; accessToken: string }> {
    if (!this.isInitialized() || !window.FB) {
      throw new Error("Facebook login is not ready yet.");
    }

    return new Promise((resolve, reject) => {
      window.FB.login(
        (response: any) => {
          if (!response?.authResponse?.accessToken) {
            reject(new Error("Facebook login was cancelled."));
            return;
          }

          window.FB.api(
            "/me",
            {
              fields: "id,name,email,picture.width(200).height(200)",
              access_token: response.authResponse.accessToken,
            },
            (profile: any) => {
              if (profile?.error) {
                reject(new Error(profile.error.message || "Failed to load Facebook profile."));
                return;
              }

              resolve({
                accessToken: response.authResponse.accessToken,
                user: {
                  id: profile.id,
                  email: profile.email || "",
                  name: profile.name || "",
                  picture: profile.picture?.data?.url,
                },
              });
            }
          );
        },
        { scope: "public_profile,email" }
      );
    });
  }
}

export const facebookAuth = new FacebookAuthService();
