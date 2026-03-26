import { apiRequest } from "@/lib/api";
import { API_BASE_URL } from "@/lib/endpoints";

export interface SellerFollowStatus {
  isFollowing: boolean;
  followerCount: number;
}

export const getSellerFollowStats = async (sellerId: string): Promise<SellerFollowStatus> => {
  const res = await apiRequest(`${API_BASE_URL}/seller-follows/${sellerId}/stats`);
  return res?.data || { isFollowing: false, followerCount: 0 };
};

export const getSellerFollowStatus = async (sellerId: string): Promise<SellerFollowStatus> => {
  const res = await apiRequest(`${API_BASE_URL}/seller-follows/${sellerId}/status`);
  return res?.data || { isFollowing: false, followerCount: 0 };
};

export const toggleSellerFollow = async (
  sellerId: string
): Promise<SellerFollowStatus & { action: "followed" | "unfollowed" }> => {
  const res = await apiRequest(`${API_BASE_URL}/seller-follows/${sellerId}/toggle`, { method: "POST" });
  return res?.data;
};
