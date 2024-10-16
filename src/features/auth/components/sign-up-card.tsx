import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { SignInFlow } from "../types";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

interface SignUpCardProps {
  setState: (state: SignInFlow) => void;
}
export const SignUpCard = ({setState}: SignUpCardProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [conformPassword, setConformPassword] = useState("");

    return (
      <Card className="w-full h-full p-8">
      <CardHeader className="px-0 pt-0">
        <CardTitle>SignUp to continue</CardTitle>
        <CardDescription className="">
          Use your email or anther service to continue
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5 px-0 pb-0">
        <form className="space-y-2.5">
          <Input
            disabled={false}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
          <Input
            disabled={false}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <Input
            disabled={false}
            type="password"
            value={conformPassword}
            onChange={(e) => setConformPassword(e.target.value)}
            placeholder="Confirm Password"
            required
          />
          <Button type="submit" className="w-full" size={"lg"} disabled={false}>
            Continue
          </Button>
        </form>
        <Separator />
        <div className="flex flex-col gap-y-2.5">
          <Button
            disabled={false}
            onClick={() => {}}
            variant={"outline"}
            size={"lg"}
            className="w-full relative"
          >
            <FcGoogle className="size-5 absolute top-2.5 left-2.5" />
            Continue with Google
          </Button>
          <Button
            disabled={false}
            onClick={() => {}}
            variant={"outline"}
            size={"lg"}
            className="w-full relative"
          >
            <FaGithub className="size-5 absolute top-2.5 left-2.5" />
            Continue with GitHub
          </Button>

          <p className="text-xs text-muted-foreground">
            Already have an account? 
            <span onClick={()=> setState("signIn")} className="text-sky-700 pl-1 hover:underline cursor-pointer">
              Sign In
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
    );
};