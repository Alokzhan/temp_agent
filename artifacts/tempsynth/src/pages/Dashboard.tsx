import { useState } from "react";
import { DataInput } from "@/components/DataInput";
import { PipelineVisualization } from "@/components/PipelineVisualization";
import { ResultsDashboard } from "@/components/ResultsDashboard";
import { Cpu, Github, BookOpen } from "lucide-react";

export default function Dashboard() {
  const [isPipelineRunning, setIsPipelineRunning] = useState(false);
  const [pipelineData, setPipelineData] = useState<{ result: any; inputRecords: any[] } | null>(null);

  const handlePipelineStart = () => {
    setIsPipelineRunning(true);
    setPipelineData(null);
  };

  const handlePipelineComplete = (data: { result: any; inputRecords: any[] } | null) => {
    setIsPipelineRunning(false);
    if (data) setPipelineData(data);
  };

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">

      {/* Top Bar */}
      <header className="border-b border-border/60 bg-card/40 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 border border-primary/20">
              <Cpu className="w-4 h-4 text-primary" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold tracking-tight text-foreground">TempSynth</span>
              <span className="text-base text-primary font-mono font-light">Agentic AI</span>
              <span className="hidden sm:inline-block text-xs font-mono text-muted-foreground border border-border rounded px-1.5 py-0.5 ml-1">v1.0</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
            <span className="hidden md:flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              SYSTEM ONLINE
            </span>
            <span className="hidden sm:block text-border">|</span>
            <span className="hidden sm:block">9-Agent Pipeline</span>
            <span className="text-border">|</span>
            <span>Statistical Engine</span>
          </div>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-6 py-10 space-y-10 pb-24">

        {/* Hero */}
        <section className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-semibold tracking-wider uppercase">
            <Cpu className="w-3 h-3" />
            Multi-Agent Synthetic Data Generation
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground leading-tight">
            Generate Realistic<br />
            <span className="text-primary">Synthetic Temperature Data</span>
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed max-w-2xl">
            Feed historical temperature records for any months, select target months to synthesize,
            and watch a 9-agent AI pipeline clean, analyze, forecast, generate, validate, and refine
            statistically consistent data — in seconds.
          </p>

          <div className="flex flex-wrap gap-6 pt-1">
            {[
              { label: "Agents", value: "9" },
              { label: "Validation Metrics", value: "6" },
              { label: "Supported Months", value: "12" },
              { label: "Max Refinement Iterations", value: "3" },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-primary font-mono">{value}</span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="h-px bg-border" />

        {/* Input Section */}
        <section className="space-y-3">
          <div className="flex items-center gap-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Step 1 — Configure Input</h3>
            <div className="flex-1 h-px bg-border" />
          </div>
          <DataInput
            onPipelineStart={handlePipelineStart}
            onPipelineComplete={handlePipelineComplete}
          />
        </section>

        {/* Pipeline Section */}
        <section className="space-y-3">
          <div className="flex items-center gap-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Step 2 — Pipeline Execution</h3>
            <div className="flex-1 h-px bg-border" />
          </div>
          <PipelineVisualization
            isPipelineRunning={isPipelineRunning}
            pipelineResult={pipelineData?.result}
          />
        </section>

        {/* Results */}
        {pipelineData && (
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Step 3 — Results & Analysis</h3>
              <div className="flex-1 h-px bg-border" />
            </div>
            <ResultsDashboard
              pipelineResult={pipelineData.result}
              inputRecords={pipelineData.inputRecords}
            />
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 bg-card/30">
        <div className="max-w-screen-xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Cpu className="w-3 h-3 text-primary" />
            <span>TempSynth Agentic AI &mdash; Multi-Agent Synthetic Weather Data Pipeline</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono">9-Agent Architecture</span>
            <span className="text-border">|</span>
            <span className="font-mono">Statistical Engine</span>
            <span className="text-border">|</span>
            <span className="font-mono">B.Tech CSE — Alok Verma</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
