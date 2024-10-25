import { format } from "date-fns";

interface ChannelHeroProps {
  name: string;
  creationTime: Date;
}

export const ChannelHero = ({ name, creationTime }: ChannelHeroProps) => {
  return (
    <div className="mt-[88px] mx-5 mb-4">
      <p className="text-3xl font-bold flex items-center mb-2">
        👋 Welcome to # {name} channel
      </p>
      <p className="font-normal text-slate-800 mb-4">
        This channel was created on {format(creationTime, "MMMM do, yyyy")}.
        This is the very beigining of <strong>{name}</strong> channel
      </p>
    </div>
  );
};
