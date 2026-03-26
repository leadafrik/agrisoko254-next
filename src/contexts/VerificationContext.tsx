"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

interface VerificationStatus {
  phoneVerified: boolean;
  idVerified: boolean;
  trustScore: number;
  verificationLevel: string;
}

interface VerificationContextType {
  verificationStatus: VerificationStatus | null;
  refreshVerification: () => void;
  requiresVerification: (type: string) => boolean;
  showVerificationModal: boolean;
  setShowVerificationModal: (show: boolean) => void;
}

const VerificationContext = createContext<VerificationContextType | undefined>(undefined);

export const VerificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const { user } = useAuth();

  const refreshVerification = useCallback(() => {
    const u = user as any;
    const idVerified = u?.verification?.status === "approved" || !!u?.verification?.idVerified;
    setVerificationStatus({
      phoneVerified: u?.verification?.phoneVerified || false,
      idVerified,
      trustScore: u?.verification?.trustScore || 0,
      verificationLevel: u?.verification?.verificationLevel || "basic",
    });
    if (user && !u?.verification?.phoneVerified) {
      setShowVerificationModal(true);
    }
  }, [user]);

  const requiresVerification = (type: string): boolean => {
    if (!verificationStatus) return false;
    switch (type) {
      case "land-listing":
      case "equipment-listing":
        return !verificationStatus.phoneVerified;
      case "agrovet-listing":
        return !verificationStatus.phoneVerified;
      default:
        return false;
    }
  };

  useEffect(() => { refreshVerification(); }, [refreshVerification]);

  return (
    <VerificationContext.Provider value={{ verificationStatus, refreshVerification, requiresVerification, showVerificationModal, setShowVerificationModal }}>
      {children}
    </VerificationContext.Provider>
  );
};

export const useVerification = () => {
  const ctx = useContext(VerificationContext);
  if (!ctx) throw new Error("useVerification must be used within VerificationProvider");
  return ctx;
};
