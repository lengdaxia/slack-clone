import { Input } from "@/components/ui/input";
import { useCreateChannelModal } from "../store/use-create-channel-modal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { useCreateChannel } from "../api/use-create-channel";
import { usePageWorkspaceId } from "@/app/hooks/use-page-workspace-id";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const CreateChannelModal = () => {
  const workspaceId = usePageWorkspaceId();
  const router = useRouter();
  const { mutate, isPending } = useCreateChannel();
  const [open, setOpen] = useCreateChannelModal();
  const [name, setName] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s+/g, "-").toLowerCase();
    setName(value);
  };

  const handleClose = () => {
    setName("");
    setOpen(false);
  };

  const handleSumbit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    mutate(
      {
        workspaceId,
        name,
      },
      {
        onSuccess(channelId) {
          router.push(`/workspace/${workspaceId}/channel/${channelId}`);
          handleClose();
        },
        onError(error) {
          toast.error("Failed to create channel");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a channel</DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSumbit}>
          <Input
            required
            value={name}
            disabled={isPending}
            onChange={handleChange}
            autoFocus
            minLength={3}
            maxLength={80}
            placeholder="eg.D&R"
          />
          <div className="flex justify-end">
            <Button disabled={isPending}>Create</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
