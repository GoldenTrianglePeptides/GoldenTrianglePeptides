import { Suspense } from "react";
import LoginForm from "./LoginForm";

export const metadata = {
  title: "Sign In | Golden Triangle Peptides",
};

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
