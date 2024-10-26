import { useParams } from "next/navigation";
import { Id } from "../../../convex/_generated/dataModel";

export const usePageChannelId = () => {
  const params = useParams();
  return params.channelId as Id<"channels">;
};
