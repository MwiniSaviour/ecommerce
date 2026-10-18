"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSellerSession } from "@/lib/seller-auth";

export default function SellerIndexPage() {
  const session = useSellerSession();
  const router = useRouter();

  useEffect(() => {
    router.replace(session ? "/seller/dashboard" : "/seller/sign-in");
  }, [session, router]);

  return null;
}
