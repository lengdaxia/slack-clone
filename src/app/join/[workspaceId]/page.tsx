"use client";

import { usePageWorkspaceId } from "@/app/hooks/use-page-workspace-id";
import { AppLoader } from "@/components/app-loader";
import { Button } from "@/components/ui/button";
import { useGetWorkspacePublicInfo } from "@/features/workspaces/api/use-get-workspace-public-Info";
import { useJoinMember } from "@/features/workspaces/api/use-join-member";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import VerificationInput from "react-verification-input";
import { toast } from "sonner";

const JoinPage = () => {
  const router = useRouter();
  const workspaceId = usePageWorkspaceId();
  const { data, isLoading } = useGetWorkspacePublicInfo({ workspaceId });
  const { mutate: joinWorkspace, isPending } = useJoinMember();

  const isMember = useMemo(() => data?.isMember, [data?.isMember]);
  useEffect(() => {
    if (isMember) {
      router.replace("/");
    }
  }, [workspaceId, isMember, router]);

  const handleJoin = (value: string) => {
    joinWorkspace(
      {
        workspaceId,
        joinCode: value,
      },
      {
        onSuccess() {
          router.replace(`/workspace/${workspaceId}`);
          toast.success("Workspace joined");
        },
        onError(error) {
          toast.error(`Failed to join workspace ${error.message}`);
        },
      }
    );
  };

  if (isLoading) {
    return <AppLoader />;
  }

  return (
    <div className="h-full flex flex-col items-center justify-center bg-white gap-y-8 p-8 rounded-md shadow-md">
      <Image src={"/logo.svg"} width={60} height={60} alt={"logo"}></Image>
      <div className="flex flex-col gap-y-4 justify-center items-center max-w-md">
        <div className="flex flex-col gap-y-2 justify-center items-center max-w-md">
          <h1 className="text-2xl font-bold">Join Workspaces </h1>
          <p className="text-sm text-muted-foreground">
            Enter workspace joincode to join
          </p>
        </div>
      </div>
      <VerificationInput
        onComplete={handleJoin}
        length={6}
        classNames={{
          container: cn(
            "flex gap-x-2",
            isPending && "opcity-50 cursor-not-allow"
          ),
          character:
            "uppercase h-auto rounded-md border-gray-300  text-gray-500 flex items-center justify-center font-medium text-lg",
          characterInactive: "text-muted",
          characterSelected: "text-black bg-white",
          characterFilled: "text-black bg-white",
        }}
      />

      <div className="flex gap-x-4">
        <Button disabled={isPending} size={"lg"} variant={"outline"} asChild>
          <Link href={"/"}>Back to home</Link>
        </Button>
      </div>
    </div>
  );
};

export default JoinPage;
