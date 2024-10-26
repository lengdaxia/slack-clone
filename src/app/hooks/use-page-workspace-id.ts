import { useParams } from "next/navigation";
import { Id } from "../../../convex/_generated/dataModel";

export const usePageWorkspaceId = () => {
  const params = useParams();
  return params.workspaceId as Id<"workspaces">;
};
