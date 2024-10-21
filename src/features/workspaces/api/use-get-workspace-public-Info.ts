import { useQuery } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { Id } from "../../../../convex/_generated/dataModel";

interface UseGetWorkspaceProps {
  workspaceId: Id<"workspaces">;
}

export const useGetWorkspacePublicInfo = ({workspaceId}: UseGetWorkspaceProps)=> {
  const data = useQuery(api.workspaces.getPublicInfo, {workspaceId});
  const isLoading = data === undefined;

  return {data, isLoading};
}