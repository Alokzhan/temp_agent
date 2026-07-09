export function parseCSV(csvText: string) {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
  const dateIdx = headers.indexOf('date');
  const minTempIdx = headers.indexOf('min_temp');
  const maxTempIdx = headers.indexOf('max_temp');
  const avgTempIdx = headers.indexOf('avg_temp');

  if (dateIdx === -1 || minTempIdx === -1 || maxTempIdx === -1 || avgTempIdx === -1) {
    throw new Error('CSV must contain headers: date, min_temp, max_temp, avg_temp');
  }

  const records = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const cols = lines[i].split(',').map(c => c.trim());
    records.push({
      date: cols[dateIdx],
      min_temp: Number(cols[minTempIdx]),
      max_temp: Number(cols[maxTempIdx]),
      avg_temp: Number(cols[avgTempIdx]),
    });
  }

  return records;
}

export function exportCSV(records: { date: string; min_temp: number; max_temp: number; avg_temp: number }[]) {
  if (!records || records.length === 0) return;

  const header = "date,min_temp,max_temp,avg_temp\n";
  const rows = records.map(r => `${r.date},${r.min_temp},${r.max_temp},${r.avg_temp}`).join('\n');
  const csvContent = header + rows;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "synthetic_temperatures.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
