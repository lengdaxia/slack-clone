import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { FaChevronRight } from "react-icons/fa";

interface ThreadReplyIndicatorPros {
  threadCount?: number;
  threadImage?: string;
  threadName?: string;
  threadTimestamp?: number;
  onClick?: () => void;
}

export const ThreadReplyIndicator = ({
  threadCount,
  threadImage,
  threadName = "member",
  threadTimestamp,
  onClick,
}: ThreadReplyIndicatorPros) => {
  if (!threadCount || !threadTimestamp) return null;
  const fallback = threadName.charAt(0).toUpperCase();

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-start p-1 rounded-md bg-white border border-transparent hover:border-border group/thread-bar transition max-w-[600px]"
    >
      <div className="flex items-center overflow-hidden gap-2">
        {/* user avatar */}
        <Avatar className="size-4 rounded-md shrink-0">
          <AvatarImage className="rounded-md " src={threadImage} />
          <AvatarFallback className="rounded-md">{fallback}</AvatarFallback>
        </Avatar>
        {/* replay count message*/}
        <span className="text-sky-700/80 hover:underline font-bold truncate">
          {`${threadCount} ${threadCount > 1 ? "replies " : "reply "}`}
        </span>
        <span className="text-xs text-muted-foreground truncate group-hover/thread-bar:hidden block">
          Last reply {formatDistanceToNow(threadTimestamp, { addSuffix: true })}
        </span>
        <span className="text-xs text-muted-foreground truncate group-hover/thread-bar:block hidden ">
          View thread
        </span>
      </div>

      {/* arrow */}
      <FaChevronRight className="size-3 ml-auto mr-2 group-hover/thread-bar:block hidden" />
    </button>
  );
};
