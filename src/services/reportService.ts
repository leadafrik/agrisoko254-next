import { apiRequest } from "@/lib/api";
import { API_BASE_URL } from "@/lib/endpoints";

export interface ReportSubmissionResult {
  _id?: string;
  reportId?: string;
  message?: string;
}

type Severity = "low" | "medium" | "high";
type ListingType = "land" | "product" | "equipment" | "service" | "agrovet";

const normalizeListingType = (t?: string): ListingType | undefined => {
  const v = (t || "").trim().toLowerCase();
  if (!v) return undefined;
  if (["land", "product", "equipment", "agrovet"].includes(v)) return v as ListingType;
  if (["service", "services", "professional", "professional_services"].includes(v)) return "service";
  return undefined;
};

const normalizeSeverity = (s?: string): Severity => {
  if (s === "low" || s === "medium" || s === "high") return s;
  return "medium";
};

export const submitReport = async (
  sellerId: string,
  reason: string,
  description?: string,
  listingId?: string,
  listingType?: string,
  severity?: Severity
): Promise<ReportSubmissionResult> => {
  const data = await apiRequest(`${API_BASE_URL}/reports/${sellerId}`, {
    method: "POST",
    body: JSON.stringify({
      reason,
      description: (description || "").trim() || undefined,
      listingId: listingId || undefined,
      listingType: normalizeListingType(listingType),
      severity: normalizeSeverity(severity),
    }),
  });
  const payload = data?.data || data;
  return {
    ...(typeof payload === "object" ? payload : {}),
    _id: payload?._id || payload?.reportId,
    reportId: payload?.reportId || payload?._id,
  };
};

export const reportService = { submitReport };
