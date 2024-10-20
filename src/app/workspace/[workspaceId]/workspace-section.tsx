import { Hint } from "@/components/hint";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { FaCaretDown, FaCaretRight } from "react-icons/fa";
import { useToggle } from "react-use";

interface WorkspaceSectionProp {
  children: React.ReactNode;
  label: string;
  hint: string;
  onNew?: () => void;
}
export const WorkspaceSection = ({
  children,
  label,
  hint,
  onNew,
}: WorkspaceSectionProp) => {
  const [on, toggle] = useToggle(true);

  return (
    <div className="flex flex-col px-2 mt-3">
      <div className="flex items-center group">
        <Button variant={"transparent"} onClick={toggle}>
          <FaCaretRight className={cn("size-4 mr-1 transition-transform ", on && "rotate-90")}/>
          {label}
        </Button>

        {onNew && (
          <Hint label={hint} side="top" align="center">
            <Button
            className="opacity-0 ml-auto group-hover:opacity-100 p-0.5 transition-opacity size-6 shrink-0"
            onClick={onNew}
            variant={"transparent"}
          >
            <Plus className="size-4" />
          </Button>
          </Hint>
        )}
      </div>
      {on && children}
    </div>
  );
};
