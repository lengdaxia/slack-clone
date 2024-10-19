import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface HintProps {
  label: string,
  children: React.ReactNode,
  side?: "top" | "right" | "bottom" | "left",
  align?: "start" | "center" | "end"
}

export const Hint = ({
  label,
  children,
  side = "bottom",
  align = "start"
}: HintProps) => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent side={side} align={align} className="bg-black text-white border border-white/5">
          <p className="text-xs font-medium">{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}