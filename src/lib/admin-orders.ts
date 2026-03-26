import { adminApiRequest } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/endpoints";
import {
  MarketplaceOrder,
  MarketplaceOrderPaymentStatus,
  MarketplaceOrderSellerFulfillmentStatus,
  MarketplaceOrderStatus,
} from "@/types/orders";

export const ORDER_PAYMENT_STATUS_LABELS: Record<MarketplaceOrderPaymentStatus, string> = {
  submitted: "Payment review",
  verified: "Payment verified",
  rejected: "Payment rejected",
  refunded: "Refunded",
};

export const ORDER_STATUS_LABELS: Record<MarketplaceOrderStatus, string> = {
  payment_review: "Awaiting payment review",
  confirmed: "Confirmed",
  processing: "Processing",
  delivered: "Delivered",
  payment_rejected: "Payment rejected",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export const SELLER_FULFILLMENT_STATUS_LABELS: Record<
  MarketplaceOrderSellerFulfillmentStatus,
  string
> = {
  awaiting_payment_confirmation: "Awaiting payment review",
  ready_to_ship: "Ready to ship",
  delivery_in_progress: "Delivery in progress",
  delivered: "Delivered",
};

export const listAdminMarketplaceOrders = async (params?: {
  status?: string;
  paymentStatus?: string;
  search?: string;
}) => {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.paymentStatus) query.set("paymentStatus", params.paymentStatus);
  if (params?.search) query.set("search", params.search);

  const url = `${API_ENDPOINTS.admin.orders.list}${
    query.toString() ? `?${query.toString()}` : ""
  }`;

  const response = await adminApiRequest(url);
  return response as {
    success: boolean;
    data: MarketplaceOrder[];
    stats: {
      total: number;
      paymentReviewCount: number;
      confirmedCount: number;
      deliveredCount: number;
    };
  };
};

export const updateAdminMarketplaceOrderPayment = async (
  orderId: string,
  action: "verify" | "reject" | "refund",
  adminNote?: string
) => {
  const response = await adminApiRequest(API_ENDPOINTS.admin.orders.payment(orderId), {
    method: "PUT",
    body: JSON.stringify({ action, adminNote }),
  });

  return response as {
    success: boolean;
    message?: string;
    data: MarketplaceOrder;
  };
};

export const updateAdminMarketplaceOrderStatus = async (
  orderId: string,
  orderStatus: Extract<MarketplaceOrderStatus, "processing" | "delivered" | "cancelled">,
  adminNote?: string
) => {
  const response = await adminApiRequest(API_ENDPOINTS.admin.orders.status(orderId), {
    method: "PUT",
    body: JSON.stringify({ orderStatus, adminNote }),
  });

  return response as {
    success: boolean;
    message?: string;
    data: MarketplaceOrder;
  };
};
