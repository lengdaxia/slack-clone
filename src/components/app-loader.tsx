import { cn } from "@/lib/utils";
import { Loader } from "lucide-react";

interface AppLoaderProps {
  size?: number;
  bgColor?: string;
  loaderColor?: string;
}
export const AppLoader = ({
  size = 5,
  bgColor = "bg-white",
  loaderColor = "text-gray-500",
}: AppLoaderProps) => {
  return (
    <div
      className={cn(
        "h-full flex bg-[#5E2C5F] items-center justify-center",
        bgColor && bgColor
      )}
    >
      <Loader
        className={cn(
          "size-5 animate-spin",
          size && `size-${size}`,
          loaderColor
        )}
      />
    </div>
  );
};
