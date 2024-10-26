import dynamic from "next/dynamic";
import { Doc, Id } from "../../convex/_generated/dataModel";
import { format, isToday, isYesterday } from "date-fns";
import { Hint } from "./hint";
import { UserAvatarButton } from "./user-avatar-button";
import { ImageGallery } from "./image-gallery";
import { MessageToolbar } from "./message-toolbar";
import { useUpdateMessage } from "@/features/messages/api/use-update-message";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRemoveMessage } from "@/features/messages/api/use-remove-message";
import { useConfirm } from "@/app/hooks/use-confirm";
import { useToggleReaction } from "@/features/reactions/api/use-toggle-reaction";
import { MessageReactions } from "./message-reactions";

const Renderer = dynamic(() => import("@/components/renderer"), { ssr: false });
const Editor = dynamic(() => import("@/components/editor"), { ssr: false });

interface MessageProps {
  id: Id<"messages">;
  memberId: Id<"members">;
  authorImage?: string;
  authorName?: string;
  isAuthor: boolean;
  reactions: Array<
    Omit<Doc<"reactions">, "memberId"> & {
      count: number;
      memberIds: Id<"members">[];
    }
  >;
  body: Doc<"messages">["body"];
  image: string | null | undefined;
  createdAt: Doc<"messages">["_creationTime"];
  updatedAt: Doc<"messages">["updateAt"];
  isEditing: boolean;
  isCompact?: boolean;
  setEditingId: (id: Id<"messages"> | null) => void;
  hideThreadButton?: boolean;
  threadCount?: number;
  threadImage?: string;
  threadTimestamp?: number;
}

export const Message = ({
  id,
  memberId,
  authorImage,
  authorName,
  isAuthor,
  reactions,
  body,
  image,
  createdAt,
  updatedAt,
  isEditing,
  setEditingId,
  isCompact,
  hideThreadButton,
  threadCount,
  threadImage,
  threadTimestamp,
}: MessageProps) => {
  const [ConfirmDialog, confirm] = useConfirm(
    "are you sure to delete this message?",
    "delete action is ireversiable."
  );

  const { mutate: updateMessage, isPending: isUpdatingMessage } =
    useUpdateMessage();

  const { mutate: removeMessage, isPending: isRemovingMessage } =
    useRemoveMessage();

  const { mutate: toggleReactin, isPending: isTogglingReactions } =
    useToggleReaction();

  const handleUpdate = ({ body }: { body: string }) => {
    updateMessage(
      { id, body },
      {
        onSuccess() {
          toast.success("Message updated");
          setEditingId(null);
        },
        onError() {
          toast.error("Failed to update message.");
        },
      }
    );
  };

  const handleRemove = async () => {
    const ok = await confirm();
    if (!ok) return;
    removeMessage(
      { id },
      {
        onSuccess() {
          toast.success("Message deleted");
          // TODO: Close thread if opened
        },
        onError(error) {
          toast.error("Failed to delete the message");
        },
      }
    );
  };

  const handleReaction = (value: string) => {
    toggleReactin(
      { messageId: id, value },
      {
        onError(error) {
          toast.error("Failed to add reaction");
        },
      }
    );
  };

  const createDate = new Date(createdAt);
  const EditSpan = () =>
    updatedAt && (
      <span className="text-xs text-muted-foreground">(edited)</span>
    );

  const MessageTopRightToolbar = () =>
    !isEditing && (
      <MessageToolbar
        isAuthor={isAuthor}
        isPending={isUpdatingMessage || isRemovingMessage}
        handleEdit={() => setEditingId(id)}
        handleThread={() => {}}
        handleDelete={handleRemove}
        handleReaction={handleReaction}
        hideThreadButton={hideThreadButton}
      />
    );

  const MessageEditor = () => (
    <div className="w-full h-full">
      <Editor
        onSubmit={handleUpdate}
        disable={isUpdatingMessage}
        onCancel={() => setEditingId(null)}
        defaultValue={JSON.parse(body)}
        variant="update"
      />
    </div>
  );

  const ReactionsSection = () => (
    <MessageReactions reactions={reactions} onChange={handleReaction} />
  );

  if (isCompact)
    // compact message
    return (
      <>
        <ConfirmDialog />
        <div
          className={cn(
            "flex flex-col gap-2 p-1.5 px-5 hover:bg-gray-100/60 group relative",
            isEditing && "bg-[#f2c74433] hover:bg-[#f2c74433]",
            isRemovingMessage &&
              "bg-rose-500/50 transform transition-all scale-y-0 origin-bottom duration-300"
          )}
        >
          <div className="flex items-start gap-2">
            <Hint label={formatFullTime(createDate)}>
              <button className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 w-[40px] leading-[22px] text-center hover:underline">
                {format(createDate, "hh:mm")}
              </button>
            </Hint>
            {isEditing ? (
              <MessageEditor />
            ) : (
              <div className="w-full flex flex-col">
                <Renderer value={body} />
                <ImageGallery images={[image]} />
                <EditSpan />
                <ReactionsSection />
              </div>
            )}
          </div>
          {/* message's toobar */}
          <MessageTopRightToolbar />
        </div>
      </>
    );
  return (
    // normal message with user image and name
    <>
      <ConfirmDialog />
      <div
        className={cn(
          "flex flex-col gap-2 p-1.5 px-5 hover:bg-gray-100/60 group relative",
          isEditing && "bg-[#f2c74433] hover:bg-[#f2c74433]",
          isRemovingMessage &&
            "bg-rose-500/50 transform transition-all scale-y-0 origin-bottom duration-300"
        )}
      >
        <div className="flex items-start gap-2">
          <UserAvatarButton image={authorImage} name={authorName} />
          {isEditing ? (
            <MessageEditor />
          ) : (
            <div className="flex flex-col w-full overflow-hidden">
              <div className="text-sm">
                <button
                  onClick={() => {}}
                  className="font-bold text-primary hover:underline"
                >
                  {authorName}
                </button>
                <span>&nbsp;&nbsp;</span>
                <Hint label={formatFullTime(createDate)}>
                  <button className="text-xs text-muted-foreground hover:underline">
                    {format(createDate, "h:mm a")}
                  </button>
                </Hint>
              </div>
              <Renderer value={body} />
              <ImageGallery
                images={[image]}
                onClick={(index) => console.log(" clicked:", index)}
              />
              <EditSpan />
              <ReactionsSection />
            </div>
          )}
        </div>
        {/* message's toobar */}
        <MessageTopRightToolbar />
      </div>
    </>
  );
};

const formatFullTime = (date: Date) => {
  return `${isToday(date) ? "Today" : isYesterday(date) ? "Yesterday" : format(date, "MMM d, yyyy")} at ${format(date, "h:mm:ss")}`;
};
