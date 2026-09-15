"use client";
import { Button } from "@/components/ui/button";
import { CirclePlay, CircleStop, StepForward } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Progress } from "./progress";

const BUTTON_VARIANT = "outline";

export function AgentProgress({ className, agentName, description, imgLink }) {
  return (
    <Card className={cn("w-[400px]", className)}>
      <CardHeader>
        <div className="flex items-center space-x-4">
          <div>
            <Avatar className="size-24">
              <AvatarImage src={imgLink ?? null} alt="AgentName"></AvatarImage>
              <AvatarFallback>{agentName}</AvatarFallback>
            </Avatar>
          </div>
          <div>
            <div id="titleSection">
              <CardTitle>
                <p className="text-base">{agentName ?? "Unnamed Agent"}</p>
              </CardTitle>
              <p className="text-xs">
                {description ?? "Describe your agent..."}
              </p>
            </div>
            <Separator className="my-1" />
            <CardDescription>
              <div className="text-xs">
                <p>Status goes here...</p>
                <p>Current action goes here...</p>
              </div>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-3">
          <div>
            <Progress className="h-6" />
          </div>
          <div className="space-x-2 flex justify-start">
            <Button className="cursor-pointer h-8" variant={BUTTON_VARIANT}>
              <CirclePlay /> Start
            </Button>
            <Button className="cursor-pointer h-8" variant={BUTTON_VARIANT}>
              <CircleStop /> Stop
            </Button>
            <Button className="cursor-pointer h-8" variant={BUTTON_VARIANT}>
              <StepForward /> Resume
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
