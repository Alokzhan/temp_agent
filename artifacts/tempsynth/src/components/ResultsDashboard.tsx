import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend } from "recharts";
import { Download, CheckCircle2, XCircle, Clock, Zap, TrendingUp, AlertTriangle } from "lucide-react";
import { exportCSV } from "@/lib/csv-utils";

interface ResultsDashboardProps {
  pipelineResult: any;
  inputRecords: any[];
}

export function ResultsDashboard({ pipelineResult, inputRecords }: ResultsDashboardProps) {
  if (!pipelineResult) return null;

  const { validation, analysis, agent_logs, synthetic_records, report_summary, total_duration_ms, refinement_iterations } = pipelineResult;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-500/10 border-green-500/20";
    if (score >= 50) return "bg-yellow-500/10 border-yellow-500/20";
    return "bg-red-500/10 border-red-500/20";
  };

  // Combine input and synthetic data for charting
  const combinedData = [
    ...inputRecords.map(r => ({ ...r, type: "Input", avg_input: r.avg_temp, min_input: r.min_temp, max_input: r.max_temp })),
    ...synthetic_records.map((r: any) => ({ ...r, type: "Synthetic", avg_synth: r.avg_temp, min_synth: r.min_temp, max_synth: r.max_temp }))
  ];

  return (
    <div className="space-y-6 mt-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={`border ${getScoreBg(validation.quality_score)}`}>
          <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
            <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Quality Score</span>
            <span className={`text-5xl font-black ${getScoreColor(validation.quality_score)}`}>
              {validation.quality_score}
            </span>
            <span className="text-xs text-muted-foreground mt-2 font-mono">/ 100</span>
          </CardContent>
        </Card>
        
        <Card className="bg-card">
          <CardContent className="p-6 flex flex-col justify-center h-full">
            <DatabaseStat icon={<DatabaseIcon />} label="Records Generated" value={synthetic_records.length} />
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-6 flex flex-col justify-center h-full">
            <DatabaseStat icon={<Clock className="text-primary w-5 h-5" />} label="Pipeline Duration" value={`${total_duration_ms} ms`} />
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="p-6 flex flex-col justify-center h-full">
            <DatabaseStat icon={<Zap className="text-primary w-5 h-5" />} label="Refinement Loops" value={refinement_iterations} />
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl">Temperature Trajectory</CardTitle>
            <CardDescription>Input data (Jan-Feb) vs Synthetic Generation (Mar-Apr)</CardDescription>
          </div>
          <Button onClick={() => exportCSV(synthetic_records)} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={combinedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" tick={{fontSize: 12}} tickFormatter={(val) => val.substring(5)} />
                <YAxis stroke="hsl(var(--muted-foreground))" tick={{fontSize: 12}} unit="°C" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Legend />
                <Line type="monotone" dataKey="avg_input" name="Input Avg Temp" stroke="hsl(var(--muted-foreground))" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="avg_synth" name="Synthetic Avg Temp" stroke="hsl(var(--primary))" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Analysis & Report */}
        <Card className="bg-card border-border h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              AI Analysis & Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground uppercase font-mono">Seasonal Trend</span>
                <p className="font-medium">{analysis.seasonal_trend}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground uppercase font-mono">Detected Pattern</span>
                <p className="font-medium">{analysis.detected_pattern}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <span className="text-xs text-muted-foreground uppercase font-mono">AI Insights</span>
              <p className="text-sm leading-relaxed border-l-2 border-primary pl-4 py-1 text-foreground/90">
                {analysis.ai_insights}
              </p>
            </div>

            <div className="pt-4 border-t border-border">
              <span className="text-xs text-muted-foreground uppercase font-mono block mb-2">Executive Summary</span>
              <blockquote className="text-sm italic bg-muted/50 p-4 rounded-md">
                "{report_summary}"
              </blockquote>
            </div>
          </CardContent>
        </Card>

        {/* Validation Metrics & Logs */}
        <div className="space-y-6 flex flex-col">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="w-5 h-5 text-primary" />
                Validation Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <MetricBox label="Mean Diff" value={validation.mean_diff.toFixed(2)} target="< 2.0" passed={Math.abs(validation.mean_diff) < 2} />
                <MetricBox label="Std Dev Diff" value={validation.std_diff.toFixed(2)} target="< 1.5" passed={Math.abs(validation.std_diff) < 1.5} />
                <MetricBox label="Correlation" value={validation.correlation.toFixed(2)} target="> 0.7" passed={validation.correlation > 0.7} />
                <MetricBox label="RMSE" value={validation.rmse.toFixed(2)} target="< 3.0" passed={validation.rmse < 3.0} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border flex-1">
            <CardHeader>
              <CardTitle className="text-lg">Detailed Agent Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {agent_logs.map((log: any, i: number) => (
                  <AccordionItem value={`item-${i}`} key={i} className="border-border">
                    <AccordionTrigger className="hover:no-underline hover:bg-muted/50 px-2 rounded-sm transition-colors">
                      <div className="flex items-center gap-3">
                        {log.status === 'success' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> :
                         log.status === 'failed' ? <XCircle className="w-4 h-4 text-destructive" /> :
                         <Clock className="w-4 h-4 text-muted-foreground" />}
                        <span className="font-mono text-sm">{log.agent}</span>
                        <Badge variant="outline" className="ml-auto text-xs font-normal">
                          {log.duration_ms}ms
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-2 pt-2 pb-4 text-sm text-muted-foreground font-mono bg-black/20 rounded-md mt-1 border border-border/50">
                      {log.message}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DatabaseStat({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) {
  return (
    <div className="flex items-center gap-4">
      <div className="p-3 bg-primary/10 rounded-lg">
        {icon}
      </div>
      <div>
        <p className="text-sm text-muted-foreground font-medium mb-1">{label}</p>
        <p className="text-2xl font-bold font-mono">{value}</p>
      </div>
    </div>
  );
}

function DatabaseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>
  );
}

function MetricBox({ label, value, target, passed }: { label: string, value: string, target: string, passed: boolean }) {
  return (
    <div className={`p-3 rounded-lg border ${passed ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-medium text-muted-foreground uppercase">{label}</span>
        {passed ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-destructive" />}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-xl font-bold font-mono text-foreground">{value}</span>
        <span className="text-xs text-muted-foreground font-mono">tgt: {target}</span>
      </div>
    </div>
  );
}
