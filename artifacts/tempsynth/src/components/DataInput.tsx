import { useState } from "react";
import { useGetSampleData, useGenerateSyntheticData } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { parseCSV } from "@/lib/csv-utils";
import { toast } from "sonner";
import { Database, FileCode, Play, FlaskConical, CalendarRange, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";

const MONTHS = [
  { num: 1, short: "Jan", full: "January" },
  { num: 2, short: "Feb", full: "February" },
  { num: 3, short: "Mar", full: "March" },
  { num: 4, short: "Apr", full: "April" },
  { num: 5, short: "May", full: "May" },
  { num: 6, short: "Jun", full: "June" },
  { num: 7, short: "Jul", full: "July" },
  { num: 8, short: "Aug", full: "August" },
  { num: 9, short: "Sep", full: "September" },
  { num: 10, short: "Oct", full: "October" },
  { num: 11, short: "Nov", full: "November" },
  { num: 12, short: "Dec", full: "December" },
];

export function DataInput({
  onPipelineStart,
  onPipelineComplete,
}: {
  onPipelineStart: () => void;
  onPipelineComplete: (data: any) => void;
}) {
  const [inputType, setInputType] = useState<"sample" | "csv">("sample");
  const [csvText, setCsvText] = useState("");
  const [targetMonths, setTargetMonths] = useState<number[]>([3, 4]);
  const [targetYear, setTargetYear] = useState(2024);

  const { data: sampleData, isLoading: isLoadingSample } = useGetSampleData();
  const generateMutation = useGenerateSyntheticData();

  const handleRunPipeline = async () => {
    let records: any[] = [];

    if (inputType === "sample") {
      if (!sampleData?.records) {
        toast.error("Sample data not loaded yet.");
        return;
      }
      records = sampleData.records;
    } else {
      if (!csvText.trim()) {
        toast.error("Please paste CSV data first.");
        return;
      }
      try {
        records = parseCSV(csvText);
      } catch (e: any) {
        toast.error(`CSV Parsing Error: ${e.message}`);
        return;
      }
    }

    if (records.length < 7) {
      toast.error("Need at least 7 temperature records to run the pipeline.");
      return;
    }

    if (targetMonths.length === 0) {
      toast.error("Please select at least one target month.");
      return;
    }

    onPipelineStart();

    generateMutation.mutate(
      { data: { records, target_months: targetMonths, target_year: targetYear } },
      {
        onSuccess: (result) => {
          if (result.success) {
            toast.success(`Pipeline complete — ${result.synthetic_records.length} records generated.`);
          } else {
            toast.warning("Pipeline finished with warnings.");
          }
          onPipelineComplete({ result, inputRecords: records });
        },
        onError: () => {
          toast.error("Pipeline execution failed. Check input data format.");
          onPipelineComplete(null);
        },
      }
    );
  };

  const toggleMonth = (month: number) => {
    setTargetMonths((prev) =>
      prev.includes(month) ? prev.filter((m) => m !== month) : [...prev, month].sort((a, b) => a - b)
    );
  };

  const selectRange = (start: number, end: number) => {
    const range = Array.from({ length: end - start + 1 }, (_, i) => i + start);
    setTargetMonths(range);
  };

  const inputMonths = inputType === "sample"
    ? [1, 2]
    : [];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-0 border border-border rounded-xl overflow-hidden bg-card">

      {/* Left Panel — Input Source */}
      <div className="xl:col-span-2 p-6 space-y-5 border-b xl:border-b-0 xl:border-r border-border">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Input Source</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setInputType("sample")}
            className={cn(
              "flex flex-col items-start gap-1.5 rounded-lg border p-3 text-left transition-all duration-200",
              inputType === "sample"
                ? "border-primary/60 bg-primary/5 text-foreground"
                : "border-border bg-background text-muted-foreground hover:border-border/80 hover:text-foreground"
            )}
            data-testid="btn-use-sample"
          >
            <FlaskConical className={cn("w-4 h-4", inputType === "sample" ? "text-primary" : "")} />
            <span className="text-xs font-semibold">Sample Dataset</span>
            <span className="text-xs opacity-70">Jan–Feb 2024, 60 records</span>
          </button>
          <button
            onClick={() => setInputType("csv")}
            className={cn(
              "flex flex-col items-start gap-1.5 rounded-lg border p-3 text-left transition-all duration-200",
              inputType === "csv"
                ? "border-primary/60 bg-primary/5 text-foreground"
                : "border-border bg-background text-muted-foreground hover:border-border/80 hover:text-foreground"
            )}
            data-testid="btn-paste-csv"
          >
            <FileCode className={cn("w-4 h-4", inputType === "csv" ? "text-primary" : "")} />
            <span className="text-xs font-semibold">Paste CSV</span>
            <span className="text-xs opacity-70">Custom historical data</span>
          </button>
        </div>

        {inputType === "sample" && sampleData && (
          <div className="rounded-lg border border-border bg-background p-4 space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="text-xl font-bold text-primary font-mono">{sampleData?.records?.length ?? 0}</div>
                <div className="text-xs text-muted-foreground mt-0.5">Records</div>
              </div>
              <div className="text-center border-x border-border">
                <div className="text-xl font-bold text-primary font-mono">2</div>
                <div className="text-xs text-muted-foreground mt-0.5">Months</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-primary font-mono">~13°</div>
                <div className="text-xs text-muted-foreground mt-0.5">Avg Jan</div>
              </div>
            </div>
            <Separator />
            <p className="text-xs text-muted-foreground leading-relaxed">{sampleData.description}</p>
          </div>
        )}

        {inputType === "sample" && isLoadingSample && (
          <div className="rounded-lg border border-border bg-background p-4 flex items-center gap-3">
            <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <span className="text-sm text-muted-foreground">Loading sample dataset...</span>
          </div>
        )}

        {inputType === "csv" && (
          <div className="space-y-2">
            <Label htmlFor="csvData" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              CSV Data
            </Label>
            <Textarea
              id="csvData"
              placeholder={"date,min_temp,max_temp,avg_temp\n2024-01-01,8.5,18.2,13.4\n2024-01-02,9.1,17.8,13.5"}
              className="font-mono text-xs min-h-[160px] bg-background resize-none"
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              data-testid="input-csv-data"
            />
            <p className="text-xs text-muted-foreground">
              Required columns: <code className="text-primary">date</code>, <code className="text-primary">min_temp</code>, <code className="text-primary">max_temp</code>, <code className="text-primary">avg_temp</code>
            </p>
          </div>
        )}
      </div>

      {/* Middle Panel — Target Month Selection */}
      <div className="xl:col-span-2 p-6 space-y-5 border-b xl:border-b-0 xl:border-r border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarRange className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Target Months</span>
          </div>
          {targetMonths.length > 0 && (
            <Badge variant="outline" className="text-primary border-primary/40 text-xs font-mono">
              {targetMonths.length} selected
            </Badge>
          )}
        </div>

        {/* Quick-select presets */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { label: "Q1", months: [1, 2, 3] },
            { label: "Q2", months: [4, 5, 6] },
            { label: "Q3", months: [7, 8, 9] },
            { label: "Q4", months: [10, 11, 12] },
            { label: "Full Year", months: [1,2,3,4,5,6,7,8,9,10,11,12] },
            { label: "Clear", months: [] },
          ].map((preset) => (
            <button
              key={preset.label}
              onClick={() => setTargetMonths(preset.months)}
              className="px-2 py-1 rounded text-xs font-semibold border border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
              data-testid={`btn-preset-${preset.label.toLowerCase().replace(" ", "-")}`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Month grid */}
        <div className="grid grid-cols-4 gap-1.5">
          {MONTHS.map(({ num, short, full }) => {
            const isInput = inputMonths.includes(num);
            const isSelected = targetMonths.includes(num);
            return (
              <button
                key={num}
                onClick={() => !isInput && toggleMonth(num)}
                disabled={isInput}
                title={isInput ? `${full} — Input data month` : full}
                data-testid={`btn-month-${num}`}
                className={cn(
                  "relative flex flex-col items-center justify-center rounded-lg border py-2.5 text-center transition-all duration-150 text-xs font-semibold",
                  isInput
                    ? "border-border/30 bg-muted/30 text-muted-foreground/40 cursor-not-allowed"
                    : isSelected
                    ? "border-primary/70 bg-primary/10 text-primary shadow-sm shadow-primary/10"
                    : "border-border bg-background text-muted-foreground hover:border-border/80 hover:text-foreground cursor-pointer"
                )}
              >
                {isInput && (
                  <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-muted-foreground/30" title="Input month" />
                )}
                {isSelected && !isInput && (
                  <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary" />
                )}
                {short}
              </button>
            );
          })}
        </div>

        {targetMonths.length > 0 && (
          <div className="text-xs text-muted-foreground font-mono">
            Generating: {targetMonths.map(m => MONTHS[m - 1].short).join(", ")}
          </div>
        )}
      </div>

      {/* Right Panel — Config + Run */}
      <div className="xl:col-span-1 p-6 flex flex-col justify-between gap-6 bg-card/60">
        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Config</span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="year" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Target Year
            </Label>
            <Input
              id="year"
              type="number"
              value={targetYear}
              min={2000}
              max={2099}
              onChange={(e) => setTargetYear(parseInt(e.target.value))}
              className="bg-background font-mono"
              data-testid="input-target-year"
            />
          </div>

          <div className="rounded-lg border border-border bg-background p-3 space-y-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pipeline</div>
            <div className="space-y-1">
              {["Collector", "Cleaning", "Analyzer", "Forecaster", "Planner", "Generator", "Validator", "Refiner", "Reporter"].map((a, i) => (
                <div key={a} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-mono text-primary/60">{String(i + 1).padStart(2, "0")}</span>
                  <span>{a}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Button
          size="lg"
          className="w-full font-bold tracking-widest relative overflow-hidden group"
          onClick={handleRunPipeline}
          disabled={generateMutation.isPending || targetMonths.length === 0}
          data-testid="button-run-pipeline"
        >
          {generateMutation.isPending ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              Running...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Play className="w-4 h-4" />
              RUN PIPELINE
            </span>
          )}
          <span className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
        </Button>
      </div>
    </div>
  );
}
