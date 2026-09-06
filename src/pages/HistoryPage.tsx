import React, { useState, useEffect } from 'react';
import { 
  History, 
  Download, 
  FileSpreadsheet, 
  Trash2, 
  Search, 
  Filter, 
  Clock,
  ArrowDownToLine
} from 'lucide-react';
import { store } from '../services/store';
import { TelemetryPoint } from '../types';

export const HistoryPage: React.FC = () => {
  const [telemetry, setTelemetry] = useState<TelemetryPoint[]>(store.getTelemetry());
  const [searchFilter, setSearchFilter] = useState('');
  const [timeSpan, setTimeSpan] = useState<'all' | '1h' | '6h' | '24h'>('all');

  useEffect(() => {
    const unsub = store.subscribe(() => {
      setTelemetry(store.getTelemetry());
    });
    return unsub;
  }, []);

  const handleExportCSV = () => {
    store.exportTelemetryCSV();
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(telemetry, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `akshu-telemetry-dump-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filteredLogs = telemetry.filter((pt) => {
    if (!searchFilter) return true;
    const q = searchFilter.toLowerCase();
    return pt.deviceId.toLowerCase().includes(q) || String(pt.temperature).includes(q) || String(pt.airQuality).includes(q);
  }).slice(-100).reverse();

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white font-mono tracking-tight flex items-center gap-2.5">
            <History className="w-6 h-6 text-blue-400" />
            <span>Telemetry History & Audit Logs</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Persisted time-series sensor samples with structured CSV and JSON exports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-md transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search by device ID or value..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>

        <div className="text-xs font-mono text-slate-400 self-end sm:self-center">
          Showing <strong>{filteredLogs.length}</strong> latest data packets
        </div>
      </div>

      {/* Telemetry Log Table */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-xl overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400">
              <th className="pb-3 font-semibold">Timestamp</th>
              <th className="pb-3 font-semibold">Device Node</th>
              <th className="pb-3 font-semibold">Temperature</th>
              <th className="pb-3 font-semibold">Humidity</th>
              <th className="pb-3 font-semibold">Air Quality</th>
              <th className="pb-3 font-semibold">Ambient Light</th>
              <th className="pb-3 font-semibold text-right">Battery</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {filteredLogs.map((log) => {
              const date = new Date(log.timestamp);
              return (
                <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 text-slate-400">
                    {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="py-2.5 font-bold text-white">{log.deviceId}</td>
                  <td className="py-2.5 text-cyan-400 font-bold">{store.formatTemp(log.temperature ?? 24)}</td>
                  <td className="py-2.5 text-blue-400">{log.humidity ?? 50}%</td>
                  <td className="py-2.5 text-emerald-400">{log.airQuality ?? 35} AQI</td>
                  <td className="py-2.5 text-yellow-300">{log.light ?? 400} lux</td>
                  <td className="py-2.5 text-right text-slate-400">{log.battery ?? 100}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
