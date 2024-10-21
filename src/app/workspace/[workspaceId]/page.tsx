"use client";

import { useChannelId } from "@/app/hooks/use-channel-id";
import { useWorkspaceId } from "@/app/hooks/use-workspace-id";
import { AppLoader } from "@/components/app-loader";
import { EmptyTip } from "@/components/empty-tip";
import { useCreateChannel } from "@/features/channels/api/use-create-channel";
import { useGetChannels } from "@/features/channels/api/use-get-channels";
import { CreateChannelModal } from "@/features/channels/conponents/create-channel-modal";
import { useCreateChannelModal } from "@/features/channels/store/use-create-channel-modal";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

const WorkspaceIdPage = () => {
  const router = useRouter();
  const [open, setOpen] = useCreateChannelModal();

  const workspaceId = useWorkspaceId();
  const {data: currentMember, isLoading: memberLoading} = useCurrentMember({workspaceId});
  const {data: workspace, isLoading: workspaceLoading} = useGetWorkspace({id: workspaceId});
  const {data: channels, isLoading: channelsLoading} = useGetChannels({workspaceId});

  const firstChannelId = useMemo(() => channels?.[0]?._id, [channels]);
  const isAdmin = useMemo(() => currentMember?.role === "admin", [
    currentMember
  ]);

  useEffect(() => {
    console.log("workspaceIdPage: " + {workspace, currentMember})

    if (workspaceLoading || channelsLoading || memberLoading || !currentMember || !workspace) return ;
    
    if (firstChannelId) {
     router.push(`/workspace/${workspaceId}/channel/${firstChannelId}`);
    } else if(!open && isAdmin){
      setOpen(true);
    }
  }, [firstChannelId, open, setOpen, router, memberLoading, channelsLoading, workspaceLoading, isAdmin]);

  if (workspaceLoading || channelsLoading) {
    return <AppLoader />
  }

  if (!workspace) {
    return <EmptyTip label="Workspace not found"/>
  }
  console.log("workspaceIdPage: " + workspace.name , "channels: ", channels?.length, "isAdmin:", isAdmin)
  return <EmptyTip label="No channel found"/>;
};

export default WorkspaceIdPage;