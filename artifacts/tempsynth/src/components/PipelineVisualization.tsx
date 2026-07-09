import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGetPipelineStatus } from "@workspace/api-client-react";
import { CheckCircle2, Circle, XCircle, Loader2, FastForward, Activity } from "lucide-react";
import { Card } from "@/components/ui/card";

interface PipelineVisualizationProps {
  isPipelineRunning: boolean;
  pipelineResult: any | null;
}

export function PipelineVisualization({ isPipelineRunning, pipelineResult }: PipelineVisualizationProps) {
  const { data: pipelineStatus } = useGetPipelineStatus();
  
  // Local state to simulate agents lighting up sequentially while pending
  const [simulatedActiveAgent, setSimulatedActiveAgent] = useState<number>(-1);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPipelineRunning) {
      setSimulatedActiveAgent(0);
      interval = setInterval(() => {
        setSimulatedActiveAgent(prev => {
          if (!pipelineStatus?.agents) return prev;
          if (prev >= pipelineStatus.agents.length - 1) return prev;
          return prev + 1;
        });
      }, 1500); // Shift every 1.5s as a simulation
    } else {
      setSimulatedActiveAgent(-1);
    }
    return () => clearInterval(interval);
  }, [isPipelineRunning, pipelineStatus]);

  if (!pipelineStatus?.agents) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-primary">
          <Activity className="w-6 h-6" />
          Agentic Pipeline
        </h2>
        {isPipelineRunning && (
          <div className="flex items-center text-sm text-primary animate-pulse font-mono bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            PIPELINE ACTIVE
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {pipelineStatus.agents.map((agent, index) => {
          
          let status: "idle" | "running" | "success" | "failed" | "skipped" = "idle";
          let message = agent.description;
          
          if (pipelineResult?.agent_logs) {
            const log = pipelineResult.agent_logs.find((l: any) => l.agent === agent.name);
            if (log) {
              status = log.status;
              message = log.message;
            }
          } else if (isPipelineRunning) {
            if (index < simulatedActiveAgent) status = "success";
            else if (index === simulatedActiveAgent) status = "running";
          }

          const isRunning = status === "running";
          const isSuccess = status === "success";
          const isFailed = status === "failed";

          return (
            <motion.div
              key={agent.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className={`relative h-full p-4 border transition-all duration-300 ${
                  isRunning ? "border-primary bg-primary/5 shadow-[0_0_15px_rgba(var(--primary),0.3)] scale-[1.02]" :
                  isSuccess ? "border-green-500/50 bg-green-500/5" :
                  isFailed ? "border-destructive bg-destructive/10" :
                  "border-border bg-card/50"
                }`}
              >
                {/* Connection line to next card (desktop only) */}
                {index < pipelineStatus.agents.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-4 h-px bg-border z-0" />
                )}

                <div className="flex items-start justify-between mb-2">
                  <div className="flex flex-col">
                    <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">
                      {agent.role}
                    </span>
                    <h4 className="font-bold text-sm text-foreground">{agent.name}</h4>
                  </div>
                  <div className="shrink-0 mt-1">
                    {status === "idle" && <Circle className="w-5 h-5 text-muted-foreground" />}
                    {status === "running" && <Loader2 className="w-5 h-5 text-primary animate-spin" />}
                    {status === "success" && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                    {status === "failed" && <XCircle className="w-5 h-5 text-destructive" />}
                    {status === "skipped" && <FastForward className="w-5 h-5 text-muted-foreground" />}
                  </div>
                </div>

                <p className={`text-xs mt-3 ${isRunning ? 'text-primary' : 'text-muted-foreground'} line-clamp-3 transition-colors`}>
                  {message}
                </p>

              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
