"use client";

import { useChannelId } from "@/app/hooks/use-channel-id";
import { AppLoader } from "@/components/app-loader";
import { useGetChannel } from "@/features/channels/api/use-get-channel";
import { Header } from "./header";
import { EmptyTip } from "@/components/empty-tip";
import { ChatInput } from "./chat-input";
import { useGetMessages } from "@/features/messages/api/use-get-messages";
import { MessageList } from "@/components/message-list";

const ChannelIdPage = () => {
  const channelId = useChannelId();
  const { results, status, loadMore } = useGetMessages({ channelId });
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
      <MessageList
        channelName={channel.name}
        channelCreateTime={channel._creationTime}
        data={results}
        loadMore={loadMore}
        isLoadingMore={status === "LoadingMore"}
        canLoadMore={status === "CanLoadMore"}
      />
      <ChatInput placeholder={`Message at # ${channel.name}`} />
    </div>
  );
};

export default ChannelIdPage;
