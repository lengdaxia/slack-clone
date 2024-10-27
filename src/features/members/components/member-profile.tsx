import { Button } from "@/components/ui/button";
import { Id } from "../../../../convex/_generated/dataModel";
import { useGetMemberUser } from "../api/use-get-member";
import { MailIcon, XIcon } from "lucide-react";
import { AppLoader } from "@/components/app-loader";
import { EmptyTip } from "@/components/empty-tip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

interface MemberProfileProps {
  memberId: Id<"members">;
  onClose: () => void;
}

export const MemberProfile = ({ memberId, onClose }: MemberProfileProps) => {
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
  );
};
