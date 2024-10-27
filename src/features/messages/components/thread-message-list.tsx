import { Button } from "@/components/ui/button";
import { Id } from "../../../../convex/_generated/dataModel";
import { Loader, XIcon } from "lucide-react";
import { useGetMessage } from "../api/use-get-message";
import { AppLoader } from "@/components/app-loader";
import { EmptyTip } from "@/components/empty-tip";
import { Message } from "@/components/message";
import { usePageWorkspaceId } from "@/app/hooks/use-page-workspace-id";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { usePageChannelId } from "@/app/hooks/use-page-channel-id";
import Quill from "quill";
import { useCreateMessage } from "../api/use-create-message";
import { useUploadImage } from "@/features/upload/api/use-upload-image";
import { toast } from "sonner";
import { differenceInMinutes, format, isToday, isYesterday } from "date-fns";
import { useGetMessages } from "../api/use-get-messages";

const ThreadEditor = dynamic(() => import("@/components/editor"), {
  ssr: false,
});

interface ThreadMessageListProps {
  messageId: Id<"messages">;
  onClose: () => void;
}
type SendThreadMessageValues = {
  channelId: Id<"channels">;
  workspaceId: Id<"workspaces">;
  parentMessageId: Id<"messages">;
  body: string;
  image?: Id<"_storage">;
};

const formatDatLabel = (dateStr: string) => {
  const date = new Date(dateStr);
  if (isToday(date)) {
    return "Today";
  } else if (isYesterday(date)) {
    return "YesterDay";
  } else {
    return format(date, "EEEE, MMMM d");
  }
};

const TIME_TRESHOLD = 5; // 5m

export const ThreadMessageList = ({
  messageId,
  onClose,
}: ThreadMessageListProps) => {
  const workspaceId = usePageWorkspaceId();
  const { data: currentMember } = useCurrentMember({ workspaceId });
  const channelId = usePageChannelId();
  const editorRef = useRef<Quill | null>(null);

  const [editorKey, setEditorKey] = useState(0); // clear editor when message sended
  const [isPending, setIsPending] = useState(false);

  const { mutate: createMessage } = useCreateMessage();
  const { mutate: getUploadUrl } = useUploadImage();
  const { data: message, isLoading: loadingMessage } = useGetMessage({
    id: messageId,
  });

  const [editingId, setEditingId] = useState<Id<"messages"> | null>(null);
  const { results, status, loadMore } = useGetMessages({
    channelId,
    parentMessageId: messageId,
  });
  const isLoadingMessages = status === "LoadingFirstPage";
  const isLoadingMore = status === "LoadingMore";
  const canLoadMore = status === "CanLoadMore";

  const groupedMessages = results?.reduce(
    (groups, message) => {
      const date = new Date(message._creationTime);
      const dateKey = format(date, "yyy-MM-dd");
      if (!groups[dateKey]) {
        groups[dateKey] = [message];
      } else {
        groups[dateKey].unshift(message);
      }
      return groups;
    },
    {} as Record<string, typeof results>
  );

  // const reversedMapEntries = Array.from(groupedMessages).reverse();
  const reversedDateKey = Object.keys(groupedMessages).reverse();

  const handleThreadSubmit = async ({
    body,
    image,
  }: {
    body: string;
    image: File | null;
  }) => {
    try {
      setIsPending(true);
      editorRef?.current?.enable(false);

      const sendMessage: SendThreadMessageValues = {
        workspaceId,
        channelId,
        parentMessageId: messageId,
        body,
        image: undefined,
      };

      if (image) {
        const url = await getUploadUrl({}, { throwError: true });
        if (!url) {
          throw new Error("image url not generate");
        }
        const result = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": image.type },
          body: image,
        });

        if (!result.ok) {
          throw new Error("Failed to upload image");
        }
        const { storageId } = await result.json();
        sendMessage.image = storageId;
      }

      await createMessage(sendMessage, { throwError: true });
      setEditorKey((prev) => prev + 1);
    } catch (error) {
      toast.error("Failed to send message!");
    } finally {
      setIsPending(false);
      editorRef?.current?.enable(true);
    }
  };

  const ThreadHeader = () => (
    <div className="h-[49px] flex items-center justify-between border-b px-4">
      <p className="text-xl font-bold">Thread</p>
      <Button onClick={onClose} size={"iconSm"} variant={"ghost"}>
        <XIcon className="size-4"></XIcon>
      </Button>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      <ThreadHeader />

      {(loadingMessage || isLoadingMessages) && <AppLoader />}
      {!loadingMessage && !isLoadingMessages && !message && (
        <EmptyTip label="Message not found" />
      )}

      <div className="flex-1 flex flex-col pb-4 overflow-y-auto message-scrollbar">
        {/* parent message */}
        {message && (
          <Message
            hideThreadButton
            memberId={message.memberId}
            authorImage={message.user.image}
            authorName={message.user.name}
            isAuthor={currentMember?._id === message.memberId}
            body={message.body}
            image={message.image}
            createdAt={message._creationTime}
            updatedAt={message.updateAt}
            id={message._id}
            reactions={message.reactions}
            isEditing={editingId === message._id}
            setEditingId={setEditingId}
          />
        )}
        {/* autmatic loading oberver */}
        <div
          className="h-1"
          ref={(el) => {
            if (el) {
              const observer = new IntersectionObserver(
                ([entry]) => {
                  if (entry.isIntersecting && canLoadMore) {
                    loadMore();
                  }
                },
                { threshold: 1.0 }
              );
              observer.observe(el);
              return () => observer.disconnect();
            }
          }}
        />
        {isLoadingMore && (
          <div className="text-center my-2 relative">
            <hr className="absolute top-1/2 left-0 right-0 border-t border-gray-300" />
            <span className="relative inline-block bg-white px-4 py-1 rounded-full text-xs border-gray-300 shadow-sm">
              <Loader className="size-5 animate-spin" />
            </span>
          </div>
        )}
        {/* reply messages */}
        {reversedDateKey.map((dateKey) => {
          const messages = groupedMessages[dateKey];

          return (
            <div key={dateKey}>
              <div className="text-center my-2 relative">
                <hr className="absolute top-1/2 left-0 right-0 border-t border-gray-300" />
                <span className="relative inline-block bg-white px-4 py-1 rounded-full text-xs border-gray-300 shadow-sm">
                  {formatDatLabel(dateKey)}
                </span>
              </div>

              {messages.map((message, index) => {
                const previousMessage = messages[index - 1];
                const isCompact =
                  previousMessage &&
                  previousMessage.user?._id === message.user?._id &&
                  differenceInMinutes(
                    new Date(message._creationTime),
                    new Date(previousMessage._creationTime)
                  ) < TIME_TRESHOLD;

                return (
                  <Message
                    key={message._id}
                    id={message._id}
                    memberId={message.memberId}
                    isAuthor={message.memberId === currentMember?._id}
                    authorImage={message.user.image}
                    authorName={message.user.name}
                    reactions={message.reactions}
                    body={message.body}
                    image={message.image}
                    updatedAt={message.updateAt}
                    createdAt={message._creationTime}
                    isEditing={editingId === message._id}
                    setEditingId={setEditingId}
                    isCompact={isCompact}
                    hideThreadButton
                    threadCount={message.threadCount}
                    threadImage={message.threadImage}
                    threadTimestamp={message.threadTimestamp}
                  />
                );
              })}
            </div>
          );
        })}
        {/* {Object.entries(groupedMessages || {}).map(([dateKey, messages]) => (
          <div className="" key={dateKey}>
            <div className="text-center my-2 relative">
              <hr className="absolute top-1/2 left-0 right-0 border-t border-gray-300" />
              <span className="relative inline-block bg-white px-4 py-1 rounded-full text-xs border-gray-300 shadow-sm">
                {formatDatLabel(dateKey)}
              </span>
            </div>
            {messages.map((message, index) => {
              const previousMessage = messages[index - 1];
              const isCompact =
                previousMessage &&
                previousMessage.user?._id === message.user?._id &&
                differenceInMinutes(
                  new Date(message._creationTime),
                  new Date(previousMessage._creationTime)
                ) < TIME_TRESHOLD;

              return (
                <Message
                  key={message._id}
                  id={message._id}
                  memberId={message.memberId}
                  isAuthor={message.memberId === currentMember?._id}
                  authorImage={message.user.image}
                  authorName={message.user.name}
                  reactions={message.reactions}
                  body={message.body}
                  image={message.image}
                  updatedAt={message.updateAt}
                  createdAt={message._creationTime}
                  isEditing={editingId === message._id}
                  setEditingId={setEditingId}
                  isCompact={isCompact}
                  hideThreadButton
                  threadCount={message.threadCount}
                  threadImage={message.threadImage}
                  threadTimestamp={message.threadTimestamp}
                />
              );
            })}
          </div>
        ))} */}
        {/* reply editor */}
        <div className="px-4">
          <ThreadEditor
            key={editorKey}
            onSubmit={handleThreadSubmit}
            disable={isPending}
            innerRef={editorRef}
            placeholder="Reply.."
          />
        </div>
      </div>
    </div>
  );
};
