export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://kodisha-backend-vjr9.onrender.com/api";

export const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  "https://kodisha-backend-vjr9.onrender.com";

export const API_ENDPOINTS = {
  analytics: {
    track: `${API_BASE_URL}/analytics/track`,
    admin: {
      summary: `${API_BASE_URL}/analytics/admin/summary`,
    },
  },
  auth: {
    csrfToken:          `${API_BASE_URL}/auth/csrf-token`,
    register:           `${API_BASE_URL}/auth/register`,
    login:              `${API_BASE_URL}/auth/login`,
    googleLogin:        `${API_BASE_URL}/auth/google/login`,
    facebookLogin:      `${API_BASE_URL}/auth/facebook/login`,
    checkExists:        `${API_BASE_URL}/auth/check-exists`,
    loginOtpRequest:    `${API_BASE_URL}/auth/login-otp/request`,
    loginOtpVerify:     `${API_BASE_URL}/auth/login-otp/verify`,
    emailOtpRequest:    `${API_BASE_URL}/auth/request-email-otp`,
    emailOtpVerify:     `${API_BASE_URL}/auth/verify-email-otp`,
    smsOtpRequest:      `${API_BASE_URL}/auth/request-sms-otp`,
    smsOtpVerify:       `${API_BASE_URL}/auth/verify-sms-otp`,
    passwordReset:      `${API_BASE_URL}/auth/password/reset`,
    me:                 `${API_BASE_URL}/auth/me`,
    refreshToken:       `${API_BASE_URL}/auth/refresh-token`,
    logout:             `${API_BASE_URL}/auth/logout`,
    adminInviteComplete:`${API_BASE_URL}/auth/admin-invite/complete`,
  },
  config: {
    public: `${API_BASE_URL}/config/public`,
  },
  chat: {
    start: `${API_BASE_URL}/chat/start`,
    history: (chatId: string) => `${API_BASE_URL}/chat/${chatId}/history`,
    message: (chatId: string) => `${API_BASE_URL}/chat/${chatId}/message`,
    escalate: (chatId: string) => `${API_BASE_URL}/chat/${chatId}/escalate`,
  },
  blog: {
    list:   `${API_BASE_URL}/blog`,
    bySlug: (slug: string) => `${API_BASE_URL}/blog/${slug}`,
    admin: {
      list:   `${API_BASE_URL}/admin/blog`,
      getById:(id: string) => `${API_BASE_URL}/admin/blog/${id}`,
      create: `${API_BASE_URL}/admin/blog`,
      update: (id: string) => `${API_BASE_URL}/admin/blog/${id}`,
      delete: (id: string) => `${API_BASE_URL}/admin/blog/${id}`,
    },
  },
  marketIntelligence: {
    overview: `${API_BASE_URL}/market-intelligence/overview`,
    byProduct: (productKey: string) =>
      `${API_BASE_URL}/market-intelligence/products/${productKey}`,
    history: (productKey: string) =>
      `${API_BASE_URL}/market-intelligence/products/${productKey}/history?days=1095`,
    recentHistory: (productKey: string) =>
      `${API_BASE_URL}/market-intelligence/products/${productKey}/history?days=90`,
    submissions: `${API_BASE_URL}/market-intelligence/submissions`,
    mySubmissions: `${API_BASE_URL}/market-intelligence/my-submissions`,
    deleteSubmission: (id: string) => `${API_BASE_URL}/market-intelligence/submissions/${id}`,
    admin: {
      submissions: `${API_BASE_URL}/admin/market-intelligence/submissions`,
      review: (submissionId: string) =>
        `${API_BASE_URL}/admin/market-intelligence/submissions/${submissionId}/review`,
      edit: (submissionId: string) =>
        `${API_BASE_URL}/admin/market-intelligence/submissions/${submissionId}`,
      seedMaizeBaseline: `${API_BASE_URL}/admin/market-intelligence/seed/maize-baseline`,
      seedOnionBaseline: `${API_BASE_URL}/admin/market-intelligence/seed/onion-baseline`,
      seedFertilizerBaseline: `${API_BASE_URL}/admin/market-intelligence/seed/fertilizer-baseline`,
      seedBroilerBaseline: `${API_BASE_URL}/admin/market-intelligence/seed/broiler-baseline`,
    },
  },
  listings: {
    getAll:  `${API_BASE_URL}/listings`,
    getById: (id: string) => `${API_BASE_URL}/listings/${id}`,
    create:  `${API_BASE_URL}/listings`,
    markSold:(id: string) => `${API_BASE_URL}/listings/${id}/mark-sold`,
  },
  products: {
    list:     `${API_BASE_URL}/products`,
    create:   `${API_BASE_URL}/products`,
    edit:     (id: string) => `${API_BASE_URL}/products/${id}`,
    markSold: (id: string) => `${API_BASE_URL}/products/${id}/mark-sold`,
  },
  services: {
    equipment:   { list: `${API_BASE_URL}/services/equipment` },
    professional:{ list: `${API_BASE_URL}/services/professional` },
    agrovets:    { list: `${API_BASE_URL}/agrovets` },
  },
  unifiedListings: {
    countActive: `${API_BASE_URL}/unified-listings/count/active`,
    list: (params?: URLSearchParams | string) =>
      `${API_BASE_URL}/unified-listings${params ? `?${String(params)}` : ""}`,
    create: `${API_BASE_URL}/unified-listings`,
    publish: (id: string) => `${API_BASE_URL}/unified-listings/${id}/publish`,
    markSold: (id: string) => `${API_BASE_URL}/unified-listings/${id}/mark-sold`,
    myListings: `${API_BASE_URL}/unified-listings/user/my-listings`,
    trending: (category?: string, limit = 8) => {
      const p = new URLSearchParams({ limit: String(limit) });
      if (category && category !== "all") p.set("category", category);
      return `${API_BASE_URL}/unified-listings/trending?${p}`;
    },
  },
  buyerRequests: {
    list:   `${API_BASE_URL}/buyer-requests`,
    byId:   (id: string) => `${API_BASE_URL}/buyer-requests/${id}`,
    byUser: (id: string) => `${API_BASE_URL}/buyer-requests/user/${id}`,
    create: `${API_BASE_URL}/buyer-requests`,
    respond:(id: string) => `${API_BASE_URL}/buyer-requests/${id}/respond`,
    deliveryOffer: (id: string) => `${API_BASE_URL}/buyer-requests/${id}/delivery-offers`,
  },
  orders: {
    checkout: `${API_BASE_URL}/orders/checkout`,
    my:       `${API_BASE_URL}/orders/my`,
    byId:     (id: string) => `${API_BASE_URL}/orders/${id}`,
    seller: {
      list:        `${API_BASE_URL}/orders/seller/my`,
      byId:        (id: string) => `${API_BASE_URL}/orders/seller/${id}`,
      fulfillment: (id: string) => `${API_BASE_URL}/orders/seller/${id}/fulfillment`,
    },
    requestOfferCheckout: {
      get:    (responseId: string) => `${API_BASE_URL}/orders/request-offer-checkout/${responseId}`,
      submit: (responseId: string) => `${API_BASE_URL}/orders/request-offer-checkout/${responseId}/submit`,
    },
    bulkOfferCheckout: {
      get:    (orderId: string) => `${API_BASE_URL}/orders/bulk-offer-checkout/${orderId}`,
      submit: (orderId: string) => `${API_BASE_URL}/orders/bulk-offer-checkout/${orderId}/submit`,
    },
    admin: {
      list:    `${API_BASE_URL}/admin/orders`,
      byId:    (id: string) => `${API_BASE_URL}/admin/orders/${id}`,
      payment: (id: string) => `${API_BASE_URL}/admin/orders/${id}/payment`,
      status:  (id: string) => `${API_BASE_URL}/admin/orders/${id}/status`,
    },
  },
  bulkOrders: {
    list:        `${API_BASE_URL}/bulk-orders`,
    create:      `${API_BASE_URL}/bulk-orders`,
    adminList:   `${API_BASE_URL}/admin/bulk-orders`,
    getById:     (id: string) => `${API_BASE_URL}/bulk-orders/${id}`,
    bids: {
      place:          (orderId: string) => `${API_BASE_URL}/bulk-orders/${orderId}/bids`,
      accept:         (orderId: string, bidId: string) => `${API_BASE_URL}/bulk-orders/${orderId}/bids/${bidId}/accept`,
      reject:         (orderId: string, bidId: string) => `${API_BASE_URL}/bulk-orders/${orderId}/bids/${bidId}/reject`,
      counterOffer:   (orderId: string, bidId: string) => `${API_BASE_URL}/bulk-orders/${orderId}/bids/${bidId}/counter-offer`,
      respondCounter: (orderId: string, bidId: string) => `${API_BASE_URL}/bulk-orders/${orderId}/bids/${bidId}/respond-counter`,
    },
    close:       (id: string) => `${API_BASE_URL}/bulk-orders/${id}/close`,
    complete:    (id: string) => `${API_BASE_URL}/bulk-orders/${id}/complete`,
    sellerAccept:(id: string) => `${API_BASE_URL}/bulk-orders/${id}/seller-accept`,
    sellerOrders:`${API_BASE_URL}/bulk-orders/seller/awarded`,
  },
  bulkApplications: {
    myStatus: `${API_BASE_URL}/bulk-applications/status/my`,
    submit:   `${API_BASE_URL}/bulk-applications/apply`,
    admin: {
      list:    `${API_BASE_URL}/admin/bulk-applications`,
      approve: (id: string) => `${API_BASE_URL}/admin/bulk-applications/${id}/approve`,
      reject:  (id: string) => `${API_BASE_URL}/admin/bulk-applications/${id}/reject`,
    },
  },
  messages: {
    send:     `${API_BASE_URL}/messages`,
    threads:  `${API_BASE_URL}/messages/threads`,
    withUser: (id: string) => `${API_BASE_URL}/messages/with/${id}`,
    markRead: (id: string) => `${API_BASE_URL}/messages/mark-read/${id}`,
  },
  favorites: {
    list:   `${API_BASE_URL}/favorites`,
    toggle: `${API_BASE_URL}/favorites/toggle`,
  },
  users: {
    getProfile:          (id: string) => `${API_BASE_URL}/users/${id}`,
    notificationPreferences: (id: string) =>
      `${API_BASE_URL}/users/${id}/notification-preferences`,
    uploadProfilePicture:`${API_BASE_URL}/users/profile-picture/upload`,
    deleteAccount:       `${API_BASE_URL}/users/delete-account`,
  },
  boosts: {
    create: `${API_BASE_URL}/boosts`,
    my:     `${API_BASE_URL}/boosts/my`,
    admin: {
      list:   `${API_BASE_URL}/admin/boosts`,
      review: (id: string) => `${API_BASE_URL}/admin/boosts/${id}/review`,
    },
  },
  verification: {
    idStatus: `${API_BASE_URL}/verification/id/status`,
    submitDocuments: `${API_BASE_URL}/verification/id/submit-documents`,
  },
  payments: {
    initiateStk: `${API_BASE_URL}/payments/stk/initiate`,
  },
  ratings: {
    submit:       `${API_BASE_URL}/ratings`,
    getUserRatings:(id: string) => `${API_BASE_URL}/ratings/user/${id}`,
  },
  admin: {
    login:     `${API_BASE_URL}/admin-auth/login`,
    dashboard: `${API_BASE_URL}/admin/dashboard`,
    listings: {
      getPending: `${API_BASE_URL}/admin/listings/pending`,
      getApproved:`${API_BASE_URL}/admin/listings/approved`,
      verify:     (id: string) => `${API_BASE_URL}/admin/listings/${id}/verify`,
      delete:     (id: string) => `${API_BASE_URL}/admin/listings/${id}`,
      update:     (id: string) => `${API_BASE_URL}/admin/listings/${id}`,
    },
    users: {
      getAll:      `${API_BASE_URL}/admin/users`,
      search:      `${API_BASE_URL}/admin/users/search`,
      create:      `${API_BASE_URL}/admin/users/create`,
      getById:     (id: string) => `${API_BASE_URL}/admin/users/${id}`,
      reports:     (id: string) => `${API_BASE_URL}/admin/users/${id}/reports`,
      verify:      (id: string) => `${API_BASE_URL}/admin/users/${id}/verify`,
      verifyId:    (id: string) => `${API_BASE_URL}/admin/users/${id}/verify-id`,
      suspend:     (id: string) => `${API_BASE_URL}/admin/users/${id}/suspend`,
      unsuspend:   (id: string) => `${API_BASE_URL}/admin/users/${id}/unsuspend`,
      flag:        (id: string) => `${API_BASE_URL}/admin/users/${id}/flag`,
      clearFlags:  (id: string) => `${API_BASE_URL}/admin/users/${id}/clear-flags`,
      updateEmail: (id: string) => `${API_BASE_URL}/admin/users/${id}/email`,
      updatePhone: (id: string) => `${API_BASE_URL}/admin/users/${id}/phone`,
      updateRole:  (id: string) => `${API_BASE_URL}/admin/users/${id}/role`,
      delete:      (id: string) => `${API_BASE_URL}/admin/users/${id}`,
    },
    verification: {
      pending: `${API_BASE_URL}/verification/admin/id/pending`,
      review:  (id: string) => `${API_BASE_URL}/verification/admin/id/${id}/review`,
    },
    profiles: {
      pending: `${API_BASE_URL}/admin/profiles/pending`,
      verify:  (id: string) => `${API_BASE_URL}/admin/profiles/${id}/verify`,
      reject:  (id: string) => `${API_BASE_URL}/admin/profiles/${id}/reject`,
    },
    sellers: {
      documents: (id: string) => `${API_BASE_URL}/admin/sellers/${id}/documents`,
    },
    reports: {
      getAll: `${API_BASE_URL}/reports`,
      update: (id: string) => `${API_BASE_URL}/reports/${id}`,
    },
    broadcast: `${API_BASE_URL}/admin/broadcast`,
    orders: {
      list:    `${API_BASE_URL}/admin/orders`,
      byId:    (id: string) => `${API_BASE_URL}/admin/orders/${id}`,
      payment: (id: string) => `${API_BASE_URL}/admin/orders/${id}/payment`,
      status:  (id: string) => `${API_BASE_URL}/admin/orders/${id}/status`,
    },
  },
};
