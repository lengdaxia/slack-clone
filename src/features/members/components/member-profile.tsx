import { Button } from "@/components/ui/button";
import { Id } from "../../../../convex/_generated/dataModel";
import { useGetMemberUser } from "../api/use-get-member";
import { MailIcon, XIcon } from "lucide-react";
import { AppLoader } from "@/components/app-loader";
import { EmptyTip } from "@/components/empty-tip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useCurrentMember } from "../api/use-current-member";
import { usePageWorkspaceId } from "@/app/hooks/use-page-workspace-id";
import { useUpdateMember } from "../api/use-update-member";
import { useRemoveMember } from "../api/use-remove-member";
import { toast } from "sonner";
import { useConfirm } from "@/app/hooks/use-confirm";
import { FaChevronDown } from "react-icons/fa";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

interface MemberProfileProps {
  memberId: Id<"members">;
  onClose: () => void;
}

export const MemberProfile = ({ memberId, onClose }: MemberProfileProps) => {
  const router = useRouter();
  const pageWorkspceId = usePageWorkspaceId();
  const { data: currentMember } = useCurrentMember({
    workspaceId: pageWorkspceId,
  });

  const isSelf = currentMember?._id === memberId;

  const { mutate: updateMember, isPending: isUpdatingMember } =
    useUpdateMember();
  const { mutate: removeMember, isPending: isRemovingMember } =
    useRemoveMember();

  const [RemoveDialog, confirmRemove] = useConfirm(
    "Remove member",
    "Are you sure you want to remove this member?"
  );
  const [UpdateDialog, confirmUpdate] = useConfirm(
    "Change role",
    "Are you sure you want to change this member's role?"
  );
  const [LeaveDialog, confirmLeave] = useConfirm(
    "Leave workspace",
    "Are you sure you want to leave this worksspace"
  );

  const onRemove = async () => {
    const ok = await confirmRemove();
    if (!ok) return;

    removeMember(
      {
        id: memberId,
      },
      {
        onSuccess() {
          toast.success("Member removed");
        },
        onError() {
          toast.error("Failed to remove member");
        },
      }
    );
  };

  const onLeave = async () => {
    const ok = await confirmLeave();
    if (!ok) return;

    removeMember(
      {
        id: memberId,
      },
      {
        onSuccess() {
          router.replace("/");
          toast.success("Member leaved");
          onClose();
        },
        onError() {
          toast.error("Failed to leave workspace");
        },
      }
    );
  };

  const onUpdate = async (role: "admin" | "member") => {
    const ok = await confirmUpdate();
    if (!ok) return;

    updateMember(
      {
        id: memberId,
        role: role,
      },
      {
        onSuccess() {
          toast.success("Member role chaned");
        },
        onError() {
          toast.error("Failed to change member's role");
        },
      }
    );
  };

  const { data: member, isLoading: loadingMember } = useGetMemberUser({
    memberId,
  });

  const ProfileHeader = () => (
    <div className="w-full h-[49px] px-4 border-b flex items-center justify-between">
      <p className="text-xl font-bold">Profile</p>
      <Button variant={"ghost"} onClick={onClose} size={"iconSm"}>
        <XIcon className="size-4" />
      </Button>
    </div>
  );

  if (loadingMember) {
    return (
      <div className="h-full flex flex-col">
        <ProfileHeader />
        <AppLoader />
      </div>
    );
  }

  if (!loadingMember && !member) {
    return (
      <div className="h-full flex flex-col">
        <ProfileHeader />
        <EmptyTip label="Member not found" />
      </div>
    );
  }

  return (
    <>
      <RemoveDialog />
      <LeaveDialog />
      <UpdateDialog />
      <div className="h-full flex flex-col">
        <ProfileHeader />
        <div className="flex w-full justify-center items-center p-4 mt-5">
          {/* big avatar */}
          <Avatar className="max-w-[256px] max-h-[256px] size-full rounded-md">
            <AvatarImage src={member?.user.image} className="rounded-md" />
            <AvatarFallback className="aspect-square rounded-md bg-sky-500 text-6xl text-white">
              {member?.user.name?.charAt(0).toUpperCase() ?? "M"}
            </AvatarFallback>
          </Avatar>
        </div>
        {/* name */}
        <div className="flex flex-col p-4">
          <p className="font-bold text-xl">{member?.user.name}</p>
        </div>
        {/* permission area 
        - admin / member
        - self / notSelf

        self & admin -> no op
        self & member -> leave
        other & admin -> change role remove
        other & member -> no 
      */}
        <div className="px-4 my-2">
          {isSelf && currentMember?.role === "member" ? (
            <div className="mt-0">
              <Button
                onClick={() => onLeave()}
                disabled={isRemovingMember}
                variant={"outline"}
                className="w-full"
              >
                Leave
              </Button>
            </div>
          ) : !isSelf && currentMember?.role === "admin" ? (
            <div className="flex items-center gap-2 mt-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    disabled={isUpdatingMember}
                    variant={"outline"}
                    className="w-full capitalize"
                  >
                    {member?.role} <FaChevronDown className="size-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuRadioGroup
                    value={member?.role}
                    onValueChange={(role) =>
                      onUpdate(role as "admin" | "member")
                    }
                  >
                    <DropdownMenuRadioItem value="admin">
                      Admin
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="member">
                      Member
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                onClick={onRemove}
                disabled={isRemovingMember}
                variant={"outline"}
                className="w-full"
              >
                Remove
              </Button>
            </div>
          ) : null}
        </div>

        {/* separetor */}
        <Separator />

        {/* contact info */}
        <div className="flex flex-col p-4">
          <p className="font-bold text-sm mb-4">Contact information</p>
          <div className="flex items-center gap-2">
            <div className="size-9 flex items-center justify-center rounded-md bg-muted">
              <MailIcon className="size-4" />
            </div>
            <div className="flex flex-col">
              <p className="text-[13px] font-semibold text-muted-foreground">
                Email Address
              </p>
              <Link
                href={`mailto:${member?.user.email}`}
                className="text-sm text-[#1264a3] hover:underline"
              >
                {member?.user.email}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
