import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useWorkspaceId } from "@/app/hooks/use-workspace-id";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { AppLoader } from "@/components/app-loader";
import { EmptyTip } from "@/components/empty-tip";
import { WorkspaceHeader } from "./workspace-header";
import { SidebarItem } from "./sidebar-item";
import { HashIcon, MessageSquareText, SendHorizonal } from "lucide-react";
import { useGetChannels } from "@/features/channels/api/use-get-channels";
import { WorkspaceSection } from "./workspace-section";
import { useGetMemberUsers } from "@/features/members/api/use-get-members";
import { MemberUserItem } from "./member-user-item";

export const WorkspaceSidebar = () => {
  const workspaceId = useWorkspaceId();
  const { data: member, isLoading: memberLoading } = useCurrentMember({
    workspaceId,
  });
  const { data: workspace, isLoading: workspaceLoading } = useGetWorkspace({
    id: workspaceId,
  });

  const { data: channels, isLoading: channelsLoading } = useGetChannels({
    workspaceId,
  });
  const { data: memberUsers, isLoading: memberUsersLoading } =
    useGetMemberUsers({
      workspaceId,
    });

  if (workspaceLoading || memberLoading) {
    return <AppLoader />;
  }

  if (!workspace || !member) {
    return <EmptyTip label="Workspace not found" />;
  }

  return (
    <div className="h-full bg-[#5E2C5F] flex flex-col">
      <WorkspaceHeader
        workspace={workspace}
        isAdmin={member.role === "admin"}
      />
      <div className="flex flex-col px-3 mt-3">
        <SidebarItem
          id="threads"
          label="Threads"
          icon={MessageSquareText}
          variant={"active"}
        />
        <SidebarItem
          id="drafts"
          label="Drafts & Send"
          icon={SendHorizonal}
          variant={"default"}
        />
      </div>
      <WorkspaceSection
        label="Channels"
        hint="Create new channel"
        onNew={() => {}}
      >
        {channels?.map((item) => (
          <SidebarItem
            key={item._id}
            label={item.name}
            icon={HashIcon}
            id={item._id}
          />
        ))}
      </WorkspaceSection>

      <WorkspaceSection
        label="Direct Messages"
        hint="Create new message"
        onNew={() => {}}
      >
        {memberUsers?.map((item) => (
          <MemberUserItem
            key={item._id}
            label={item.user.name!}
            image={item.user.image}
            id={item._id}
          />
        ))}
      </WorkspaceSection>
    </div>
  );
};
