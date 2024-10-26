import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { FaChevronDown } from "react-icons/fa";

interface HeaderProps {
  name?: string;
  image?: string;
  onClick?: () => void;
}

export const Header = ({ name = "member", image, onClick }: HeaderProps) => {
  const fallback = name.charAt(0).toUpperCase();

  return (
    <div className="w-full flex items-center border-b h-[49px] px-4 overflow-hidden bg-white">
      <Button
        onClick={onClick}
        variant={"ghost"}
        size={"sm"}
        className="text-lg font-semibold px-2 overflow-hidden w-auto"
      >
        <Avatar className="size-6 mr-2 rounded-md">
          <AvatarImage src={image} className="rounded-md" />
          <AvatarFallback className="rounded-md">{fallback}</AvatarFallback>
        </Avatar>
        <span className="truncate">{name}</span>
        <FaChevronDown className="size-2.5 ml-2" />
      </Button>
    </div>
  );
};
