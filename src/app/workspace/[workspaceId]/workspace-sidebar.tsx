import { useCurrentMember } from "@/features/members/api/use-current-member";
import { usePageWorkspaceId } from "@/app/hooks/use-page-workspace-id";
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
import { useCreateChannelModal } from "@/features/channels/store/use-create-channel-modal";
import { usePageChannelId } from "@/app/hooks/use-page-channel-id";
import { usePageMemberId } from "@/app/hooks/use-page-member-id";
import { usePathname } from "next/navigation";
import { useInviteNewMemberModal } from "@/features/workspaces/store/use-invite-new-member-modal";

export const WorkspaceSidebar = () => {
  const workspaceId = usePageWorkspaceId();
  const channelId = usePageChannelId();
  const memberId = usePageMemberId();
  const pathName = usePathname();

  const { setOpen: setOpenNewChannel } = useCreateChannelModal();
  const { setOpen: setInviteOpen } = useInviteNewMemberModal();

  const { data: member, isLoading: memberLoading } = useCurrentMember({
    workspaceId,
  });
  const { data: workspace, isLoading: workspaceLoading } = useGetWorkspace({
    id: workspaceId,
  });

  const { data: channels } = useGetChannels({
    workspaceId,
  });
  const { data: memberUsers } = useGetMemberUsers({
    workspaceId,
  });

  if (workspaceLoading || memberLoading) {
    return <AppLoader bgColor="bg-[#5E2C5F]" loaderColor="text-white" />;
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
          middlePath="threads"
          variant={pathName.includes("threads") ? "active" : "default"}
        />
        <SidebarItem
          id="drafts"
          label="Drafts & Send"
          icon={SendHorizonal}
          middlePath="drafts"
          variant={pathName.includes("drafts") ? "active" : "default"}
        />
      </div>
      <WorkspaceSection
        label="Channels"
        hint="Create new channel"
        onNew={
          member.role === "admin" ? () => setOpenNewChannel(true) : undefined
        }
      >
        {channels?.map((item) => (
          <SidebarItem
            key={item._id}
            label={item.name}
            icon={HashIcon}
            id={item._id}
            variant={channelId === item._id ? "active" : "default"}
          />
        ))}
      </WorkspaceSection>

      <WorkspaceSection
        label="Direct Messages"
        hint="Create new message"
        onNew={() => setInviteOpen(true)}
      >
        {memberUsers?.map((item) => (
          <MemberUserItem
            key={item._id}
            label={item.user.name!}
            image={item.user.image}
            id={item._id}
            variant={memberId === item._id ? "active" : "default"}
          />
        ))}
      </WorkspaceSection>
    </div>
  );
};
