import { usePageWorkspaceId } from "@/app/hooks/use-page-workspace-id";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { cva, VariantProps } from "class-variance-authority";
import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { IconType } from "react-icons/lib";

interface SidebarItemProps {
  id: string;
  label: string;
  icon: LucideIcon | IconType;
  middlePath?: string;
  variant?: VariantProps<typeof sidebarItemVariants>["variant"];
}

const sidebarItemVariants = cva(
  "flex items-center gap-1.5 justify-start font-normal h-7 px-[18px] text-sm overflow-hidden ",
  {
    variants: {
      variant: {
        default: "text-[#f9edffcc]",
        active: "text-[#481349] bg-white/90 hover:bg-white/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export const SidebarItem = ({
  id,
  label,
  icon: Icon,
  middlePath = "channel",
  variant = "default",
}: SidebarItemProps) => {
  const workspaceId = usePageWorkspaceId();

  let href = `/workspace/${workspaceId}/${middlePath}/${id}`;
  if (middlePath === "threads") {
    href = `/workspace/${workspaceId}/${middlePath}/`;
  } else if (middlePath === "drafts") {
    href = `/workspace/${workspaceId}/${middlePath}/`;
  }
  return (
    <Button
      variant={"transparent"}
      className={cn(sidebarItemVariants({ variant }))}
      size={"sm"}
      asChild
    >
      <Link href={href}>
        <Icon className="size-3.5 mr-0 shrink-0" />
        <p className="truncate text-sm">{label}</p>
      </Link>
    </Button>
  );
};
