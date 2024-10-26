import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useUpdateWorkspace } from "@/features/workspaces/api/use-update-workspace";
import { TrashIcon } from "lucide-react";
import { FormEvent, useState } from "react";
import { usePageWorkspaceId } from "@/app/hooks/use-page-workspace-id";
import { toast } from "sonner";
import { useRemoveWorkspace } from "@/features/workspaces/api/use-remove-workspace";
import { useRouter } from "next/navigation";
import { useConfirm } from "@/app/hooks/use-confirm";

interface PreferencesModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  initValue: string;
}
export const PreferencesModal = ({
  open,
  setOpen,
  initValue,
}: PreferencesModalProps) => {
  const router = useRouter();
  const workspaceId = usePageWorkspaceId();
  const [name, setName] = useState(initValue);
  const [editOpen, setEditOpen] = useState(false);
  const [ConfirmDialog, confirm] = useConfirm(
    "Are you sure?",
    "Delete action is irreversible!"
  );

  const { mutate: updateWorkspace, isPending: isUpdatingWorkspace } =
    useUpdateWorkspace();
  const { mutate: removeWorkspace, isPending: isRemovingWorkspace } =
    useRemoveWorkspace();

  const handleEdit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await updateWorkspace(
      {
        id: workspaceId,
        name,
      },
      {
        onSuccess() {
          toast.success("Succefully update workspace");
          setEditOpen(false);
        },
        onError(error) {
          toast.error(error.message);
        },
      }
    );
  };

  const handleRemove = async () => {
    const ok = await confirm();
    if (!ok) return;

    await removeWorkspace(
      {
        id: workspaceId,
      },
      {
        onSuccess() {
          toast.success("Succefully remove workspace");
          router.replace("/");
        },
        onError(error) {
          toast.error(error.message);
        },
      }
    );
  };

  return (
    <>
      <ConfirmDialog />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 bg-gray-50 overflow-hidden">
          <DialogHeader className="p-4 border-b bg-white">
            <DialogTitle>{initValue}</DialogTitle>
            <DialogDescription className="hidden"></DialogDescription>
          </DialogHeader>
          <div className="px-4 pb-4 flex flex-col gap-y-2">
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
              <DialogTrigger asChild>
                <div className="px-5 py-4 bg-white rounded-lg border cursor-pointer hover:bg-gray-50">
                  <div className="flex justify-between ">
                    <p className="text-sm font-semibold">Workspace name</p>
                    <p className="tetx-sm text-sky-500 hover:underline font-semibold">
                      Edit
                    </p>
                  </div>
                  <p className="text-sm">{name}</p>
                </div>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Rename this workspace</DialogTitle>
                  <DialogDescription className="hidden" />
                </DialogHeader>
                <form onSubmit={handleEdit} className="space-y-4">
                  <Input
                    disabled={isUpdatingWorkspace}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    minLength={3}
                    maxLength={80}
                    required
                    autoFocus
                    placeholder="rename your workspace"
                  />
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button
                        disabled={isUpdatingWorkspace}
                        variant={"outline"}
                      >
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button disabled={isUpdatingWorkspace} onClick={() => {}}>
                      Save
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <button
              disabled={false}
              onClick={handleRemove}
              className="flex items-center gap-x-2 px-5 py-4 border bg-white rounded-lg hover:bg-gray-50 text-rose-600 cursor-pointer"
            >
              <TrashIcon className="size-4" />
              <p className="text-sm font-semibold">Delete workspace</p>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
