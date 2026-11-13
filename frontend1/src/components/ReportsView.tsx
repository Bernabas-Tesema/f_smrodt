import React from 'react';
import { Vehicle, SecurityEvent, RemoteCommand, ESP32Device } from '../types/smrod';
import { FileText, Download, TrendingUp, ShieldAlert, Cpu, CheckCircle2 } from 'lucide-react';

interface ReportsViewProps {
  vehicles: Vehicle[];
  events: SecurityEvent[];
  commands: RemoteCommand[];
  devices: ESP32Device[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  vehicles,
  events,
  commands,
  devices
}) => {
  const downloadReport = (name: string) => {
    const data = {
      report: name,
      generated_at: new Date().toISOString(),
      summary: {
        total_vehicles: vehicles.length,
        total_devices: devices.length,
        total_security_events: events.length,
        total_commands_dispatched: commands.length
      }
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name.toLowerCase().replace(/\s+/g, '_')}_report.json`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Operational Intelligence &amp; Compliance
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Reports &amp; Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Standard V1 operational summaries covering security incidents, hardware uptime, and remote commands.
          </p>
        </div>

        <button
          onClick={() => downloadReport('SMROD_Master_Operations_Summary')}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors whitespace-nowrap self-start sm:self-auto shadow-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Master CSV / JSON</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[
          {
            title: 'Security Incident Frequency Report',
            desc: 'Aggregate breakdown of impact crashes, unauthorized towing, and tamper alerts across the connected fleet.',
            metric: `${events.length} Incidents Logged`,
            sub: '100% triaged by security operations'
          },
          {
            title: 'VSCU Fleet Connectivity Uptime',
            desc: 'LTE signal stability, GNSS satellite lock percentage, and average ping round-trip latency.',
            metric: '99.4% Uptime',
            sub: 'Dual-SIM Cat-1 cellular telemetry'
          },
          {
            title: 'Remote Command & Safety Audit Report',
            desc: 'Chronological summary of all remote engine cutoffs, siren triggers, and emergency locks.',
            metric: `${commands.length} Directives Executed`,
            sub: 'Zero unauthorized command breaches'
          },
          {
            title: 'Geofence Boundary Compliance',
            desc: 'Perimeter entry/exit events for JKIA Logistics, Industrial Area, and Mombasa maritime zones.',
            metric: '1 Perimeter Alert',
            sub: 'Response time under 90 seconds'
          },
          {
            title: 'Fleet Vehicle Utilization & Odometer',
            desc: 'Mileage accumulation, operating hours, and battery line voltage health across all registered vehicles.',
            metric: '296,220 Total Km',
            sub: 'Average battery health: 12.6V'
          },
          {
            title: 'System Access & Authentication Logs',
            desc: 'Enterprise login attempts, session renewal frequency, and operator role distribution.',
            metric: '4 Active Operators',
            sub: '2FA enforced on administrative accounts'
          }
        ].map((rep, idx) => (
          <div
            key={idx}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors"
          >
            <div className="space-y-2">
              <h3 className="font-semibold text-slate-900 text-sm">{rep.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{rep.desc}</p>
              <div className="pt-2">
                <div className="text-lg font-bold font-mono text-slate-900">{rep.metric}</div>
                <div className="text-[11px] text-emerald-600 font-medium">{rep.sub}</div>
              </div>
            </div>

            <button
              onClick={() => downloadReport(rep.title)}
              className="w-full py-1.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition-colors flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Report</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
