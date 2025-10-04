import { Suspense } from "react";
import SuccessClient from "./success-client";

export const metadata = {
  title: "Order Saved",
  alternates: { canonical: "/success" },
};

export default function SuccessPage() {
  return (
    <Suspense>
      <SuccessClient />
    </Suspense>
  );
}
