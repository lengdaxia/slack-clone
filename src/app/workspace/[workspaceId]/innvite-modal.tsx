import { useWorkspaceId } from "@/app/hooks/use-workspace-id";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRefreshJoincode } from "@/features/workspaces/api/use-refresh-joincode";
import { Copy, RefreshCcw } from "lucide-react";
import { toast } from "sonner";

interface InviteModalProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  name: string;
  joincode: string;
}
export const InviteModal = ({
  open,
  setOpen,
  name,
  joincode,
}: InviteModalProps) => {
  const workspaceId = useWorkspaceId();
  const {mutate: refreshCode, isPending} = useRefreshJoincode();

  const handleNewJoincode = () => {
    refreshCode({workspaceId}, {
      onSuccess() {
          toast.success("New join code refreshed")
      },
      onError() {
          toast.error("Failed to refresh join code")
      },
    })
  }

  const handleCopy = () => {
    const copyLink = `/workspace/${workspaceId}/join/${joincode}`;
    window.navigator.clipboard
      .writeText(copyLink)
      .then(() => toast.success("joincode link copied"));
  };

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

          <Button onClick={handleCopy} className="mt-2" variant={"ghost"} size={"sm"}>
            <span>Copy code</span>
            <Copy className="size-4 ml-2" />
          </Button>
        </div>
        <div className="flex items-center justify-between w-full">
          <Button 
          disabled={isPending}
          onClick={handleNewJoincode}
          variant={"outline"}>
            <span>Refresh</span>
            <RefreshCcw className="size-4 ml-2" />
          </Button>
          <DialogClose asChild> 
            <Button>
              Close
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};