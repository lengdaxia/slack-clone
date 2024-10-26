import { useGetMemberUser } from "@/features/members/api/use-get-member";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { Header } from "./header";
import { usePageMemberId } from "@/app/hooks/use-page-member-id";
import { AppLoader } from "@/components/app-loader";
import { EmptyTip } from "@/components/empty-tip";
import { ChatInput } from "./chat-input";
import { MessageList } from "@/components/message-list";
import { useGetMessages } from "@/features/messages/api/use-get-messages";

interface ConversationProps {
  id: Id<"conversations">;
}

export const Conversation = ({ id }: ConversationProps) => {
  const pageMemberId = usePageMemberId();
  const { data: member, isLoading: memberLoading } = useGetMemberUser({
    memberId: pageMemberId,
  });

  const { results, status, loadMore } = useGetMessages({
    conversationId: id,
  });

  if (memberLoading) {
    return <AppLoader />;
  }

  if (!member) {
    return <EmptyTip label="Member not found" />;
  }

  return (
    <div className="flex flex-col h-full">
      {/* conversation header */}
      <Header name={member.user.name} image={member.user.image} />

      {/* // message-list */}
      <MessageList
        data={results}
        variant="conversation"
        loadMore={loadMore}
        memberName={member.user.name}
        memberImage={member.user.image}
        isLoadingMore={status === "LoadingMore"}
        canLoadMore={status === "CanLoadMore"}
      />

      {/* // input editor */}
      <ChatInput
        placeholder={`Message with ${member.user.name}`}
        conversationId={id}
      />
    </div>
  );
};
