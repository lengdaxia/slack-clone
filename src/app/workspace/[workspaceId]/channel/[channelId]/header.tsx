import { useChannelId } from "@/app/hooks/use-channel-id";
import { useConfirm } from "@/app/hooks/use-confirm";
import { useWorkspaceId } from "@/app/hooks/use-workspace-id";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useRemoveChannel } from "@/features/channels/api/use-remove-channel";
import { useUpdateChannel } from "@/features/channels/api/use-update-channel";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { TrashIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { toast } from "sonner";

interface HeaderProps {
  title: string;
}

export const Header = ({ title }: HeaderProps) => {
  const router = useRouter();
  const channelId = useChannelId();
  const workspaceId = useWorkspaceId();
  const [editOpen, setEditOpen] = useState(false);
  const [ConfirmDialog, confirm] = useConfirm(
    "Are you sure?",
    "Delete action is irreversible!"
  );

  const [value, setValue] = useState(title);
  const { mutate: updateChannel, isPending: updatingChannel } =
    useUpdateChannel();
  const { mutate: removeChannel, isPending: removingChannel } =
    useRemoveChannel();

  const { data: currentMember } = useCurrentMember({ workspaceId });
  const isAdmin = useMemo(
    () => currentMember?.role === "admin",
    [currentMember]
  );

  const handleEditOpen = () => {
    if (!isAdmin) {
      return;
    }
    setEditOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s+/g, "-").toLowerCase();
    setValue(value);
  };

  const handleEdit = () => {
    updateChannel(
      { channelId, name: value },
      {
        onSuccess() {
          toast.success("Channel updated");
          setEditOpen(false);
        },
        onError() {
          toast.error("Failed to update channel");
          setEditOpen(false);
        },
      }
    );
  };

  const handleRemove = async () => {
    const ok = await confirm();
    if (!ok) return;

    removeChannel(
      { channelId },
      {
        onSuccess() {
          toast.success("Channel deleted");
          router.replace(`/workspace/${workspaceId}`);
        },
        onError() {
          toast.error("Failed to delete channel.");
        },
      }
    );
  };

  return (
    <div className="w-full h-[49px] px-4 flex bg-white items-center border-b overflow-hidden">
      <ConfirmDialog />
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant={"ghost"}
            size={"default"}
            className="text-lg font-semibold px-2 overflow-hidden w-auto"
          >
            <span># {title}</span>
            <FaChevronDown className="size-3 ml-2" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle># {title}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col px-4 pb-4 gap-y-2">
            <Dialog open={editOpen} onOpenChange={handleEditOpen}>
              <DialogTrigger asChild>
                <div className="px-5 py-4 bg-white rounded-lg border cursor-pointer hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Channel Name</p>
                    {isAdmin && (
                      <p className="text-sm font-semibold text-sky-500 hover:underline">
                        Edit
                      </p>
                    )}
                  </div>
                  <p className="text-sm"># {title}</p>
                </div>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Rename this channel</DialogTitle>
                  <div className="flex flex-col gap-y-2 px-4 pt-2 items-center justify-center">
                    <form onSubmit={handleEdit} className="w-full">
                      <Input
                        disabled={updatingChannel}
                        value={value}
                        onChange={handleChange}
                        required
                        autoFocus
                        minLength={3}
                        maxLength={80}
                        placeholder="eg. budget"
                      />
                    </form>

                    <div className="w-full flex items-center justify-end gap-x-2 py-2">
                      <DialogClose asChild>
                        <Button variant={"outline"}>Cancel</Button>
                      </DialogClose>
                      <Button disabled={updatingChannel} onClick={handleEdit}>
                        Save
                      </Button>
                    </div>
                  </div>
                </DialogHeader>
              </DialogContent>
            </Dialog>
            {isAdmin && (
              <button
                onClick={handleRemove}
                disabled={removingChannel}
                className="text-rose-500 flex items-center gap-x-2 px-2 py-4 bg-white border rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <TrashIcon className="size-4 ml-2" />
                <span className="text-sm font-semibold">Delete channel</span>
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
