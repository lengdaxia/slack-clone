import { useQuery } from "convex/react";
import { Id } from "../../../../convex/_generated/dataModel";
import { api } from "../../../../convex/_generated/api";

interface UseGetChannelProps {
  channelId: Id<"channels">;
}

export const useGetChannel = ({ channelId }: UseGetChannelProps) => {
  const data = useQuery(api.channels.getById, { channelId });
  const isLoading = data === undefined;
  return {
    data,
    isLoading,
  };
};
