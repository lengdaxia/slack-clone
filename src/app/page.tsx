"use client";

import { Button } from "@/components/ui/button";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { signOut } = useAuthActions();
  const router = useRouter();

  return (
    <div className="">
      Logged in
      <Button onClick={() => {
        signOut().finally(()=>{
          router.replace("/auth")
        })
      }}>Sign Out</Button>
    </div>
  );
}
