"use client";

import { useChannelId } from "@/app/hooks/use-channel-id";
import { useWorkspaceId } from "@/app/hooks/use-workspace-id";
import { AppLoader } from "@/components/app-loader";
import { useGetChannel } from "@/features/channels/api/use-get-channel";
import { Header } from "./header";
import { EmptyTip } from "@/components/empty-tip";


const ChannelIdPage = () => {
  const channelId = useChannelId();

  const {data: channel, isLoading: channelLoading} = useGetChannel({channelId});

  if (channelLoading) {
    return <AppLoader />
  }

  if (!channel) {
    return <EmptyTip label="Channel not found"/>
  }
  
  return (
    <div className="flex flex-col h-full">
      <Header title={channel.name}/>
    </div>
  )
}

export default ChannelIdPage;