import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";

interface ConversationHeroProps {
  name?: string;
  image?: string;
}

export const ConversationHero = ({
  name = "member",
  image,
}: ConversationHeroProps) => {
  return (
    <div className="mt-[88px] mx-5 mb-4">
      <div className="flex items-center">
        <Avatar className="size-14 mr-2 rounded-md">
          <AvatarImage src={image} className="rounded-md" />
          <AvatarFallback className="rounded-md">
            {name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <p className="text-3xl font-bold">{name}</p>
      </div>
      <p className="font-normal text-slate-800 mb-4 mt-2">
        This conversation is just between you and <strong>{name}</strong>
      </p>
    </div>
  );
};
