import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import CheckoutForm from "./CheckoutForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Checkout | Golden Triangle Peptides",
};

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=/checkout");
  }

  return <CheckoutForm userName={user.name} userEmail={user.email} />;
}
