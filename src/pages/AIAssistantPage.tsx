import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Send, 
  RefreshCw, 
  FileText, 
  TrendingUp, 
  AlertCircle, 
  ShieldCheck, 
  Lightbulb, 
  Cpu, 
  Clock,
  Layers
} from 'lucide-react';
import Markdown from 'react-markdown';
import { store } from '../services/store';
import { sendAIChatMessage, requestSystemAnalysis, requestMetricPrediction } from '../services/geminiClient';
import { AIChatMessage, Device, TelemetryPoint } from '../types';

export const AIAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'welcome_msg',
      role: 'assistant',
      content: `Hello! I am **AKSHU IoT AI**, your real-time hardware intelligence assistant.

I have direct visibility into your connected microcontrollers, environmental telemetry, active threshold alerts, and actuator states.

How can I help you optimize your IoT deployment today?`,
      timestamp: new Date().toISOString(),
      suggestedActions: [
        'Analyze my current sensor readings',
        'Summarize today’s environmental trends',
        'Check for hardware anomalies or offline nodes',
        'Explain my air quality AQI rating',
      ],
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisReport, setAnalysisReport] = useState<string | null>(null);
  const [analyzingSystem, setAnalyzingSystem] = useState(false);
  const [predictionData, setPredictionData] = useState<any | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const devices = store.getDevices();
  const telemetry = store.getTelemetry();
  const user = store.getUser();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = (customPrompt || inputPrompt).trim();
    if (!textToSend || isProcessing) return;

    const userMsg: AIChatMessage = {
      id: 'msg_' + Date.now(),
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputPrompt('');
    setIsProcessing(true);

    const result = await sendAIChatMessage(textToSend, messages);

    const aiMsg: AIChatMessage = {
      id: 'msg_' + (Date.now() + 1),
      role: 'assistant',
      content: result.content,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsProcessing(false);
  };

  const handleRunSystemAnalysis = async () => {
    setAnalyzingSystem(true);
    setAnalysisReport(null);
    const result = await requestSystemAnalysis();
    if (result.report) {
      setAnalysisReport(result.report);
    } else {
      setAnalysisReport('System analysis is currently unavailable. Please verify your GEMINI_API_KEY.');
    }
    setAnalyzingSystem(false);
  };

  const handleRunPrediction = async () => {
    const res = await requestMetricPrediction('temperature');
    setPredictionData(res);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white font-mono tracking-tight flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-cyan-400" />
            <span>Gemini AI Hardware Intelligence</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Grounded environmental diagnostics and autonomous decision support powered by Gemini 2.5.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRunSystemAnalysis}
            disabled={analyzingSystem}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold transition-colors disabled:opacity-50"
          >
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>{analyzingSystem ? 'Analyzing Hardware...' : 'Full System Analysis'}</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Context & Predictions Sidebar (1/3) + Chat Stage (2/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Live Context & Forecasts */}
        <div className="space-y-5 order-2 lg:order-1">
          {/* Active Sensor Context Badge */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>Grounded Context</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                {devices.length} Nodes Connected
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Every query is automatically enriched with the exact real-time readings from your devices. No hallucinated values.
            </p>

            <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs font-mono">
              {devices.slice(0, 2).map((dev) => (
                <div key={dev.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center justify-between text-slate-300 font-bold mb-1">
                    <span className="truncate">{dev.name}</span>
                    <span className="text-[10px] text-cyan-400">{dev.status}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex flex-wrap gap-2">
                    {dev.sensors.map(s => (
                      <span key={s.id}>
                        {s.name.split(' ')[0]}: <strong className="text-white">{s.type === 'temperature' ? store.formatTemp(s.currentValue) : `${s.currentValue}${s.unit}`}</strong>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Predictive Forecasting Tool */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Predictive Forecasting</span>
              </span>
              <button
                onClick={handleRunPrediction}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
              >
                Compute
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Synthesizes diurnal cycles from your historical data to forecast trends.
            </p>

            {predictionData ? (
              <div className="space-y-2.5 pt-2 border-t border-slate-800">
                <p className="text-xs text-slate-300 italic">{predictionData.summary || predictionData.statusMessage}</p>
                {predictionData.available && (
                  <div className="grid grid-cols-3 gap-1.5 text-center font-mono text-[10px]">
                    {predictionData.forecast?.slice(0, 3).map((f: any, i: number) => (
                      <div key={i} className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                        <div className="text-slate-500">{f.time}</div>
                        <div className="text-cyan-400 font-bold text-xs mt-0.5">{f.predictedValue}°C</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={handleRunPrediction}
                className="w-full py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-mono rounded-xl border border-slate-800 transition-colors"
              >
                Generate 6h Forecast
              </button>
            )}
          </div>
        </div>

        {/* Right 2 Columns: Chat Interactive Stream & Analysis View */}
        <div className="lg:col-span-2 space-y-4 order-1 lg:order-2 flex flex-col h-[650px] rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-xl overflow-hidden">
          {/* Diagnostic Modal / Overlay if generated */}
          {analysisReport && (
            <div className="p-5 bg-slate-950/95 border-b border-cyan-900/60 max-h-72 overflow-y-auto space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Comprehensive IoT System Analysis</span>
                </div>
                <button
                  onClick={() => setAnalysisReport(null)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Dismiss
                </button>
              </div>
              <div className="markdown-body text-xs text-slate-300 leading-relaxed space-y-2">
                <Markdown>{analysisReport}</Markdown>
              </div>
            </div>
          )}

          {/* Message List */}
          <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`space-y-2 max-w-[85%] sm:max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        isUser
                          ? 'bg-cyan-600 text-white rounded-tr-sm shadow-md'
                          : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-sm'
                      }`}
                    >
                      <div className="markdown-body">
                        <Markdown>{msg.content}</Markdown>
                      </div>
                    </div>

                    {/* Suggested Action Chips */}
                    {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {msg.suggestedActions.map((action, i) => (
                          <button
                            key={i}
                            onClick={() => handleSendMessage(action)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-700/80 text-[11px] font-medium transition-colors"
                          >
                            {action}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isProcessing && (
              <div className="flex gap-3 items-center text-cyan-400 text-xs font-mono">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                </div>
                <span>Synthesizing real-world telemetry parameters...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-3.5 bg-slate-950 border-t border-slate-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                placeholder="Ask about your sensors, alerts, or hardware automations..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 font-sans"
              />
              <button
                type="submit"
                disabled={!inputPrompt.trim() || isProcessing}
                className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shrink-0"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
