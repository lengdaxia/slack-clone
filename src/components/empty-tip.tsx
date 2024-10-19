import { AlertTriangle, LucideIcon } from "lucide-react"
import { IconType } from "react-icons/lib"

interface EmptyTipProps {
  icon?: LucideIcon | IconType;
  label?: string
}

export const EmptyTip = ({
  icon: Icon,
  label = "Nothing here"
}: EmptyTipProps) => {
  
  return (
    <div className="flex flex-col gap-y-2 h-full items-center justify-center">
      {Icon ? (<Icon className="size-5 text-white"/>) : (<AlertTriangle className="size-5 text-white"/>)}
      <p className="text-white text-sm">{label}</p>
    </div>
  )
}