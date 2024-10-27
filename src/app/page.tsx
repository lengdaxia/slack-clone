"use client";

import { useCreateWorkspaceModal } from "@/features/workspaces/store/use-create-workspace-modal";
import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AppLoader } from "@/components/app-loader";

export default function Home() {
  const router = useRouter();

  const { open, setOpen } = useCreateWorkspaceModal();
  const { data, isLoading } = useGetWorkspaces();

  const workspaceId = useMemo(() => data?.[0]?._id, [data]);

  useEffect(() => {
    if (isLoading) return;
    if (workspaceId) {
      // workspace exits then open it
      router.replace(`/workspace/${workspaceId}`);
    } else if (!open) {
      //if no workspace avaiable, create it
      console.log("Open creation modal");
      setOpen(true);
    }
  }, [router, workspaceId, isLoading, open, setOpen]);

  return <AppLoader />;
}
