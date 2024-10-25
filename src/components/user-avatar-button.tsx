import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface UserAvatarButtonProps {
  image?: string;
  name?: string;
  onClick?: () => void;
}

export const UserAvatarButton = ({
  image,
  name,
  onClick,
}: UserAvatarButtonProps) => {
  const nameLetter = name?.charAt(0).toUpperCase();
  return (
    <button onClick={onClick}>
      <Avatar className="rounded-md">
        <AvatarImage className="rounded-md" src={image} />
        <AvatarFallback className="rounded-md bg-sky-500 text-white text-sm">
          {nameLetter}
        </AvatarFallback>
      </Avatar>
    </button>
  );
};
