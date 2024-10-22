import { useChannelId } from "@/app/hooks/use-channel-id";
import { useWorkspaceId } from "@/app/hooks/use-workspace-id";
import { useCreateMessage } from "@/features/messages/api/use-create-message";
import dynamic from "next/dynamic";
import Quill from "quill";
import { useRef, useState } from "react";
import { toast } from "sonner";

const Editor = dynamic(() => import("@/components/editor"), { ssr: false });

interface ChatInputProps {
  placeholder: string;
}

export const ChatInput = ({ placeholder }: ChatInputProps) => {
  const workspaceId = useWorkspaceId();
  const channelId = useChannelId();
  const editorRef = useRef<Quill | null>(null);

  const [editorKey, setEditorKey] = useState(0); // clear editor when message sended
  const [isPending, setIsPending] = useState(false);
  const { mutate: createMessage } = useCreateMessage();

  const handleSubmit = ({
    body,
    image,
  }: {
    body: string;
    image: File | null;
  }) => {
    console.log({ body, image });

    try {
      setIsPending(true);
      createMessage(
        {
          workspaceId,
          channelId,
          body,
        },
        { throwError: true }
      );
      setEditorKey((prev) => prev + 1);
    } catch (error) {
      toast.error("Failed to send message!");
    } finally {
      setIsPending(false);
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
