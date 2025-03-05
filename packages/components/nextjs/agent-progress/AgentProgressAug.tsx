"use client";
import { useEffect, useRef } from "react";
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
import { Progress } from "@/components/ui/progress";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

type AgentState = {
  status: string;
  currentAction: string;
  running: boolean;
  paused: boolean;
  progress: number;
  pending: boolean;
  totalSteps: number;
  done: boolean;
};

type onStartOutput = Omit<
  AgentState,
  "paused" | "progress" | "running" | "pending" | "done"
>;

type progressOutput = Omit<
  AgentState,
  "paused" | "running" | "pending" | "done"
>;

type CardProps = {
  className?: string;
  agentName?: string;
  description?: string;
  imgLink?: string;
  onStart?: () => Promise<onStartOutput>;
  onStop?: () => Promise<void>;
  onResume?: (
    currentAction: AgentState["currentAction"]
  ) => Promise<onStartOutput>;
  updateProgress?: (currentState: number) => Promise<progressOutput>;
  nextState?: () => Promise<AgentState>;
  pollRateMs?: number;
};

type AgentStateActions = {
  toggleStart: () => void;
  toggleStop: () => void;
  toggleResume: () => void;
  startSuccess: (
    totalSteps: number,
    status: AgentState["status"],
    currentAction: AgentState["currentAction"]
  ) => void;
  stopSuccess: (prevState: string) => void;
  resumeSuccess: (
    totalSteps: number,
    status: AgentState["status"],
    currentAction: AgentState["currentAction"]
  ) => void;
  updateSuccess: (state: progressOutput) => void;
  setCurrentAction: (action: AgentState["currentAction"]) => void;
  setStatus: (status: AgentState["status"]) => void;
  setProgress: (progress: AgentState["progress"]) => void;
  setPending: (pending: AgentState["pending"]) => void;
  triggerDone: () => void;
};

interface TimerStore {
  timer: NodeJS.Timeout | null;
  setTimer: (timer: NodeJS.Timeout) => void;
}

const createTimerStore = () =>
  create<TimerStore>((set) => ({
    timer: null,
    setTimer: (timer) =>
      set(() => ({
        timer: timer,
      })),
  }));

const createAgentStore = () =>
  create<AgentState & AgentStateActions>((set) => ({
    progress: 0,
    status: "Offline",
    currentAction: "None",
    running: false,
    paused: false,
    pending: false,
    totalSteps: 0,
    done: false,
    toggleStart: () =>
      set(() => ({
        pending: true,
        status: "Checking...",
        currentAction: "Starting workflow...",
      })),
    toggleStop: () =>
      set(() => ({
        pending: true,
        currentAction: "Pausing workflow...",
      })),
    toggleResume: () =>
      set(() => ({
        pending: true,
        currentAction: "Resuming workflow...",
      })),
    startSuccess: (totalSteps, status, currentAction) =>
      set(() => ({
        currentAction: currentAction,
        status: status,
        running: true,
        paused: false,
        pending: false,
        totalSteps: totalSteps,
        progress: 1,
        done: false,
      })),
    resumeSuccess: (totalSteps, status, currentAction) =>
      set(() => ({
        currentAction: currentAction,
        status: status,
        running: true,
        paused: false,
        pending: false,
        totalSteps: totalSteps,
      })),
    stopSuccess: (prevState) =>
      set(() => ({
        status: "Paused",
        currentAction: prevState + " (paused)",
        running: false,
        paused: true,
        pending: false,
      })),
    updateSuccess: (state: progressOutput) => {
      set(() => ({
        status: state.status,
        currentAction: state.currentAction,
        totalSteps: state.totalSteps,
        progress: state.progress,
      }));
    },
    triggerDone: () =>
      set(() => ({
        status: "Done",
        running: false,
        paused: false,
        pending: false,
        currentAction: "None",
        done: true,
      })),
    setCurrentAction: (action) => set(() => ({ currentAction: action })),
    setStatus: (status) => set(() => ({ status: status })),
    setProgress: (progress) => set(() => ({ progress: progress })),
    setPending: (pending) => set(() => ({ pending: pending })),
  }));

const BUTTON_VARIANT = "outline";

export function AgentProgress({
  className,
  agentName,
  description,
  imgLink,
  onStart,
  onStop,
  onResume,
  updateProgress,
  pollRateMs,
}: CardProps) {
  const agentStoreRef = useRef(createAgentStore());
  const useAgentStore = agentStoreRef.current;
  const timerStoreRef = useRef(createTimerStore());
  const useTimerStore = timerStoreRef.current;
  const {
    startToggle,
    stopToggle,
    resumeToggle,
    triggerStartSuccess,
    triggerStopSuccess,
    triggerResumeSuccess,
    triggerUpdateSuccess,
    triggerDone,
  } = useAgentStore(
    useShallow((state) => ({
      startToggle: state.toggleStart,
      stopToggle: state.toggleStop,
      resumeToggle: state.toggleResume,
      triggerStartSuccess: state.startSuccess,
      triggerStopSuccess: state.stopSuccess,
      triggerResumeSuccess: state.resumeSuccess,
      triggerUpdateSuccess: state.updateSuccess,
      triggerDone: state.triggerDone,
    }))
  );

  const {
    status,
    currentAction,
    running,
    paused,
    pending,
    totalSteps,
    done,
    progress,
  } = useAgentStore(
    useShallow((state) => ({
      status: state.status,
      currentAction: state.currentAction,
      running: state.running,
      paused: state.paused,
      pending: state.pending,
      totalSteps: state.totalSteps,
      done: state.done,
      progress: state.progress,
    }))
  );

  const { timer, setTimer } = useTimerStore(
    useShallow((state) => ({
      timer: state.timer,
      setTimer: state.setTimer,
    }))
  );

  useEffect(() => {
    if (progress < totalSteps && running && !pending) {
      const t = setTimeout(() => {
        updateProgress(progress).then((res) => {
          if (!res) {
            return;
          } else {
            triggerUpdateSuccess(res);
            console.log("Triggered update:", res);
          }
        });
      }, pollRateMs ?? 2500);

      setTimer(t);
      console.log("Set timer", t);
    } else if (progress == totalSteps && !done) {
      triggerDone();
    }
  }, [progress, running]);

  useEffect(() => {
    if (pending || !running) {
      console.log("Cleared timeout", timer);
      clearTimeout(timer);
    }
  }, [status]);

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
                <p>{status}</p>
                <p>{currentAction}</p>
              </div>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-3">
          <div>
            <Progress
              className="h-6"
              max={totalSteps > 0 ? totalSteps : 100}
              value={running || done ? progress : 0}
            />
          </div>
          <div className="space-x-2 flex justify-start">
            <Button
              className="cursor-pointer h-8"
              variant={BUTTON_VARIANT}
              disabled={running || paused || pending}
              onClick={() => {
                startToggle();
                onStart().then((res: onStartOutput) => {
                  if (!res) {
                    return; // Error handling here!
                  } else {
                    console.log(res);
                    setTimeout(() => {
                      triggerStartSuccess(
                        res.totalSteps,
                        res.status,
                        res.currentAction
                      );
                    }, 1500);
                  }
                });
              }}
            >
              <CirclePlay /> Start
            </Button>
            <Button
              className="cursor-pointer h-8"
              variant={BUTTON_VARIANT}
              disabled={!running || paused || pending}
              onClick={() => {
                const ca = currentAction;
                stopToggle();
                onStop().then(() => {
                  setTimeout(() => {
                    triggerStopSuccess(ca);
                  }, 1500);
                });
              }}
            >
              <CircleStop /> Stop
            </Button>
            <Button
              className="cursor-pointer h-8"
              variant={BUTTON_VARIANT}
              disabled={!paused || pending}
              onClick={() => {
                const ca = currentAction.split(" ").slice(0, -1).join(" ");
                resumeToggle();
                onResume(ca).then((res) => {
                  setTimeout(() => {
                    triggerResumeSuccess(
                      res.totalSteps,
                      res.status,
                      res.currentAction
                    );
                  }, 2500);
                });
              }}
            >
              <StepForward /> Resume
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
