"use client";

import ChatbotWidget from "@/components/support/ChatbotWidget";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import { VerificationProvider } from "@/contexts/VerificationContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import WelcomeModal from "@/components/common/WelcomeModal";
import CookieConsentBanner from "@/components/common/CookieConsentBanner";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <FavoritesProvider>
        <ToastProvider>
          <NotificationsProvider>
            <VerificationProvider>
              {children}
              <WelcomeModal />
              <CookieConsentBanner />
              <ChatbotWidget />
            </VerificationProvider>
          </NotificationsProvider>
        </ToastProvider>
        </FavoritesProvider>
      </CartProvider>
    </AuthProvider>
  );
}
