import { Button } from "@/components/ui/button";
import { Info, Search } from "lucide-react";
import { usePageWorkspaceId } from "@/app/hooks/use-page-workspace-id";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import { useGetChannels } from "@/features/channels/api/use-get-channels";
import { useGetMemberUsers } from "@/features/members/api/use-get-members";
import { useRouter } from "next/navigation";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";

export const Toolbar = () => {
  const router = useRouter();
  const workspaceId = usePageWorkspaceId();
  const { data } = useGetWorkspace({ id: workspaceId });
  const [searchOpen, setSearchOpen] = useState(false);

  const { data: channels } = useGetChannels({ workspaceId });
  const { data: members } = useGetMemberUsers({ workspaceId });

  const onChannelSelect = (channelId: string) => {
    router.replace(`/workspace/${workspaceId}/channel/${channelId}`);
    setSearchOpen(false);
  };

  const onMemberSelect = (memberId: string) => {
    router.replace(`/workspace/${workspaceId}/member/${memberId}`);
    setSearchOpen(false);
  };

  return (
    <div className="bg-[#481349] flex items-center justify-between h-10 p-1.5">
      <div className="flex-1"></div>
      <div className="min-w-[280px] max-[642px] grow-[2] shrink">
        <Button
          onClick={() => setSearchOpen(true)}
          size={"sm"}
          className="bg-accent/25 hover:bg-accent-25 w-full justify-start h-7 px-2"
        >
          <Search className="size-4 text-white mr-2" />
          <span className="text-xs text-white">Search {data?.name}</span>
        </Button>

        <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
          <DialogTitle className="hidden" />
          <DialogDescription className="hidden" />
          <CommandInput
            autoFocus
            placeholder="Search your channels and members.."
          />
          <CommandList className="pb-2">
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Channels">
              {channels?.map((channel) => (
                <CommandItem
                  key={channel._id}
                  onSelect={() => onChannelSelect(channel._id)}
                >
                  {channel.name}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Members">
              {members?.map((member) => (
                <CommandItem
                  key={member._id}
                  onSelect={() => onMemberSelect(member._id)}
                >
                  {member.user.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      </div>
      <div className="ml-auto flex-1 flex items-center justify-end">
        <Button variant={"transparent"} size={"iconSm"}>
          <Info className="size-5 text-white"></Info>
        </Button>
      </div>
    </div>
  );
};
