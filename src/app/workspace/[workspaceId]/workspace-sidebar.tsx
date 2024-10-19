import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useWorkspaceId } from "../hooks/use-workspace-id";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { AppLoader } from "@/components/app-loader";
import { EmptyTip } from "@/components/empty-tip";
import { WorkspaceHeader } from "./workspace-header";

export const WorkspaceSidebar = () => {
  const workspaceId = useWorkspaceId();
  const { data: member, isLoading: memberLoading } = useCurrentMember({
    workspaceId,
  });
  const { data: workspace, isLoading: workspaceLoading } = useGetWorkspace({
    id: workspaceId,
  });

  if (workspaceLoading || memberLoading) {
    return <AppLoader />;
  }

  if (!workspace || !member) {
    return <EmptyTip label="Workspace not found" />;
  }

  return (
    <div className="h-full bg-[#5E2C5F] flex flex-col">
      <WorkspaceHeader workspace={workspace} isAdmin={member.role === "admin"}/>
    </div>
  );
};
