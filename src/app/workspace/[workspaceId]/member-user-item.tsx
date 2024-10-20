import { useWorkspaceId } from "@/app/hooks/use-workspace-id";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";
import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { IconType } from "react-icons/lib";
import { Id } from "../../../../convex/_generated/dataModel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MemberUserItemProps {
  id: Id<"members">;
  label?: string;
  image?: string;
  variant?: VariantProps<typeof memberUserItemVariants>["variant"];
}

const memberUserItemVariants = cva(
  "flex items-center gap-1.5 justify-start font-normal h-7 px-4 text-sm overflow-hidden ",
  {
    variants: {
      variant: {
        default: "text-[#f9edffcc]",
        active: "text-[#481349] bg-white/90 hover:bg-white/90",
      },
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export const MemberUserItem = ({
  id,
  label = "member",
  image,
  variant = "default",
}: MemberUserItemProps) => {
  const workspaceId = useWorkspaceId();
  const avatarFallback = label.charAt(0).toUpperCase();

  return (
    <Button variant={"transparent"}
      className={cn(memberUserItemVariants({variant}))}
      size={"sm"} 
      asChild
    >
      <Link href={`/workspace/${workspaceId}/member/${id}`}>
        <Avatar className="size-5 rounded-md mr-1 shrink-0">
          <AvatarImage className="rounded-md" src={image} alt="user avatar"/>
          <AvatarFallback className="rounded-md bg-sky-500 text-white"> 
            {avatarFallback}
          </AvatarFallback>
        </Avatar>
        <p className="truncate text-sm">{label}</p>
      </Link>
    </Button>
  );
};
