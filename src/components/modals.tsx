"use client";

import { InviteModal } from "@/app/workspace/[workspaceId]/innvite-modal";
import { CreateChannelModal } from "@/features/channels/conponents/create-channel-modal";
import { CreateWorkspaceModal } from "@/features/workspaces/components/create-workspace-modal";
import { useEffect, useState } from "react";

export const Modals = () => {
  // to prevent server render not complete when modals are about to show
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <CreateWorkspaceModal />
      <CreateChannelModal />
      <InviteModal />
    </>
  );
};
