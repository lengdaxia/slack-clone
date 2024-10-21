"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import VerificationInput from "react-verification-input";

const JoinPage = () => {
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
        length={6}
        classNames={{
          container: "flex gap-x-2",
          character:
            "uppercase h-auto rounded-md border-gray-300  text-gray-500 flex items-center justify-center font-medium text-lg",
          characterInactive: "text-muted",
          characterSelected: "text-black bg-white",
          characterFilled: "text-black bg-white",
        }}
      />

      <div className="flex gap-x-4">
        <Button size={"lg"} variant={"outline"} asChild>
            <Link href={"/"}>Back to home</Link>
        </Button>
      </div>
    </div>
  );
};

export default JoinPage;
