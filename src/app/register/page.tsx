import { Suspense } from "react";
import RegisterForm from "./RegisterForm";

export const metadata = {
  title: "Create Account | Golden Triangle Peptides",
};

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
