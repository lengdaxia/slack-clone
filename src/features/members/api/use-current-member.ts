import { useQuery } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { useWorkspaceId } from "@/app/workspace/hooks/use-workspace-id";
import { Id } from "../../../../convex/_generated/dataModel";

interface UseGetCurrentMemberProps {
  workspaceId: Id<"workspaces">
}

export const useCurrentMember = ({workspaceId}: UseGetCurrentMemberProps) => {
  const data = useQuery(api.members.current, {workspaceId});  
  const isLoading = data === undefined;
  return {
    data,
    isLoading
  }
}