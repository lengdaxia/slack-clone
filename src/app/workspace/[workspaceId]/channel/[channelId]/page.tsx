"use client";

import { useChannelId } from "@/app/hooks/use-channel-id";
import { AppLoader } from "@/components/app-loader";
import { useGetChannel } from "@/features/channels/api/use-get-channel";
import { Header } from "./header";
import { EmptyTip } from "@/components/empty-tip";
import { ChatInput } from "./chat-input";
import { useGetMessages } from "@/features/messages/api/use-get-messages";

const ChannelIdPage = () => {
  const channelId = useChannelId();
  const { results } = useGetMessages({ channelId });
  console.log(results);

  const { data: channel, isLoading: channelLoading } = useGetChannel({
    channelId,
  });

  if (channelLoading) {
    return <AppLoader />;
  }

  if (!channel) {
    return <EmptyTip label="Channel not found" />;
  }

  return (
    <div className="flex flex-col h-full">
      <Header title={channel.name} />
      <div className="flex-1 text-black">{JSON.stringify(results)}</div>
      <ChatInput placeholder={`Message at # ${channel.name}`} />
    </div>
  );
};

export default ChannelIdPage;
