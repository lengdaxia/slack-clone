import { Button } from "@/components/ui/button";
import { Info, Search } from "lucide-react";
import { usePageWorkspaceId } from "@/app/hooks/use-page-workspace-id";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";

export const Toolbar = () => {
  const workspaceId = usePageWorkspaceId();
  const { data } = useGetWorkspace({ id: workspaceId });

  return (
    <div className="bg-[#481349] flex items-center justify-between h-10 p-1.5">
      <div className="flex-1"></div>
      <div className="min-w-[280px] max-[642px] grow-[2] shrink">
        <Button
          size={"sm"}
          className="bg-accent/25 hover:bg-accent-25 w-full justify-start h-7 px-2"
        >
          <Search className="size-4 text-white mr-2" />
          <span className="text-xs text-white">Search {data?.name}</span>
        </Button>
      </div>
      <div className="ml-auto flex-1 flex items-center justify-end">
        <Button variant={"transparent"} size={"iconSm"}>
          <Info className="size-5 text-white"></Info>
        </Button>
      </div>
    </div>
  );
};
