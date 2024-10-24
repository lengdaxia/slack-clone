import { useChannelId } from "@/app/hooks/use-channel-id";
import { useWorkspaceId } from "@/app/hooks/use-workspace-id";
import { useCreateMessage } from "@/features/messages/api/use-create-message";
import { useUploadImage } from "@/features/upload/api/use-upload-image";
import dynamic from "next/dynamic";
import Quill from "quill";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Id } from "../../../../../../convex/_generated/dataModel";

const Editor = dynamic(() => import("@/components/editor"), { ssr: false });

interface ChatInputProps {
  placeholder: string;
}

type SendMessageValues = {
  channelId: Id<"channels">;
  workspaceId: Id<"workspaces">;
  body: string;
  image?: Id<"_storage">;
};

export const ChatInput = ({ placeholder }: ChatInputProps) => {
  const workspaceId = useWorkspaceId();
  const channelId = useChannelId();
  const editorRef = useRef<Quill | null>(null);

  const [editorKey, setEditorKey] = useState(0); // clear editor when message sended
  const [isPending, setIsPending] = useState(false);
  const { mutate: createMessage } = useCreateMessage();
  const { mutate: getUploadUrl } = useUploadImage();

  const handleSubmit = async ({
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

      const sendMessage: SendMessageValues = {
        workspaceId,
        channelId,
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

  return (
    <div className="px-5 w-full">
      <Editor
        key={editorKey}
        placeholder={placeholder}
        onSubmit={handleSubmit}
        disable={isPending}
        innerRef={editorRef}
      />
    </div>
  );
};
