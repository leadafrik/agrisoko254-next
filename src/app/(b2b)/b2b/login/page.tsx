import { redirect } from "next/navigation";

export default function B2BLoginPage() {
  redirect("/login?redirect=/bulk/orders");
}
