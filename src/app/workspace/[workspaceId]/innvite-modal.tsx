import { usePageWorkspaceId } from "@/app/hooks/use-page-workspace-id";
import { AppLoader } from "@/components/app-loader";
import { EmptyTip } from "@/components/empty-tip";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { useRefreshJoincode } from "@/features/workspaces/api/use-refresh-joincode";
import { useInviteNewMemberModal } from "@/features/workspaces/store/use-invite-new-member-modal";
import { Copy, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

export const InviteModal = () => {
  const workspaceId = usePageWorkspaceId();
  if (!workspaceId) {
    return null;
  }
  const { data: workspace, isLoading: workspaceLoading } = useGetWorkspace({
    id: workspaceId,
  });
  const { mutate: refreshCode, isPending } = useRefreshJoincode();
  const { open, setOpen } = useInviteNewMemberModal();

  const handleNewJoincode = () => {
    refreshCode(
      { workspaceId },
      {
        onSuccess() {
          toast.success("New join code refreshed");
        },
        onError() {
          toast.error("Failed to refresh join code");
        },
      }
    );
  };

  const handleCopy = () => {
    const copyLink = `${window.location.origin}/join/${workspaceId}/`;
    window.navigator.clipboard
      .writeText(copyLink)
      .then(() => toast.success("joincode link copied"));
  };

  if (workspaceLoading) {
    return <AppLoader />;
  }
  if (!workspace) {
    return <EmptyTip label="Workspace not found." />;
  }

  const name = workspace.name;
  const joincode = workspace.joinCode;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{`Invite people to ${name}`}</DialogTitle>
          <DialogDescription>
            Use the code below to invite people to your workspace
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center py-10">
          <p className="text-3xl font-bold">{joincode.toUpperCase()}</p>

          <Button
            onClick={handleCopy}
            className="mt-2"
            variant={"ghost"}
            size={"sm"}
          >
            <span>Copy Invite Link</span>
            <Copy className="size-4 ml-2" />
          </Button>
        </div>
        <div className="flex items-center justify-between w-full">
          <Button
            disabled={isPending}
            onClick={handleNewJoincode}
            variant={"outline"}
          >
            <span>Refresh</span>
            <RefreshCcw className="size-4 ml-2" />
          </Button>
          <DialogClose asChild>
            <Button>Close</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};
