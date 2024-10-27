"use client";

import { usePageMemberId } from "@/app/hooks/use-page-member-id";
import { useGetOrCreateConversation } from "@/features/conversations/api/use-get-or-create-conversation";
import { useEffect, useState } from "react";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { usePageWorkspaceId } from "@/app/hooks/use-page-workspace-id";
import { toast } from "sonner";
import { AppLoader } from "@/components/app-loader";
import { EmptyTip } from "@/components/empty-tip";
import { Conversation } from "./conversation";

const MemberIdPage = () => {
  const pageMemberId = usePageMemberId();
  const pageWorkspaceId = usePageWorkspaceId();
  const [convsersationId, setConversationId] =
    useState<Id<"conversations"> | null>(null);
  const { mutate: initAndGetConversation, isPending: isGettingConversation } =
    useGetOrCreateConversation();

  useEffect(() => {
    initAndGetConversation(
      {
        workspaceId: pageWorkspaceId,
        initMemberId: pageMemberId,
      },
      {
        onSuccess(data) {
          setConversationId(data);
        },
        onError() {
          toast.error("Failed to get conversation");
        },
      }
    );
  });

  if (isGettingConversation) {
    return <AppLoader />;
  }

  if (!convsersationId) {
    return <EmptyTip label="Conversation not found" />;
  }

  return <Conversation id={convsersationId} />;
};

export default MemberIdPage;
