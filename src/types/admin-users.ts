export type UserRecord = {
  _id: string;
  fullName?: string;
  name?: string;
  email?: string;
  phone?: string;
  userType?: string;
  role?: string;
  verification?: { idVerified?: boolean };
  fraudFlags?: number;
  accountStatus?: string;
  createdAt?: string;
  ratings?: { average?: number };
  listings?: unknown[];
};
