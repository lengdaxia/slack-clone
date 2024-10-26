import { Button } from "@/components/ui/button";
import { Id } from "../../../../convex/_generated/dataModel";
import { XIcon } from "lucide-react";
import { useGetMessage } from "../api/use-get-message";
import { AppLoader } from "@/components/app-loader";
import { EmptyTip } from "@/components/empty-tip";
import { Message } from "@/components/message";
import { useWorkspaceId } from "@/app/hooks/use-workspace-id";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useChannelId } from "@/app/hooks/use-channel-id";
import Quill from "quill";
import { useCreateMessage } from "../api/use-create-message";
import { useUploadImage } from "@/features/upload/api/use-upload-image";
import { toast } from "sonner";

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

export const ThreadMessageList = ({
  messageId,
  onClose,
}: ThreadMessageListProps) => {
  const workspaceId = useWorkspaceId();
  const { data: currentMember } = useCurrentMember({ workspaceId });
  const channelId = useChannelId();
  const editorRef = useRef<Quill | null>(null);

  const [editorKey, setEditorKey] = useState(0); // clear editor when message sended
  const [isPending, setIsPending] = useState(false);

  const { mutate: createMessage } = useCreateMessage();
  const { mutate: getUploadUrl } = useUploadImage();
  const { data: message, isLoading: loadingMessage } = useGetMessage({
    id: messageId,
  });

  const [editingId, setEditingId] = useState<Id<"messages"> | null>(null);

  const handleThreadSubmit = async ({
    body,
    image,
  }: {
    body: string;
    image: File | null;
  }) => {
    console.log({ body, image });

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
      {loadingMessage && <AppLoader />}
      {!message && <EmptyTip label="Message not found" />}

      {message && (
        <div>
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
        </div>
      )}

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
  );
};
