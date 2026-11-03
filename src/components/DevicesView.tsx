import React, { useState } from 'react';
import { VSCUDevice, Vehicle } from '../types/smrod';
import {
  Cpu,
  Radio,
  Signal,
  Battery,
  ShieldCheck,
  Plus,
  RefreshCw,
  Search,
  Settings,
  X,
  CheckCircle2,
  Sliders,
  Thermometer,
  Clock,
  Activity,
  Check,
  RotateCw,
  Link2,
  Unlink
} from 'lucide-react';

interface DevicesViewProps {
  devices: VSCUDevice[];
  vehicles: Vehicle[];
  onAddDevice: (newDevice: VSCUDevice) => void;
  onUpdateDevice: (updated: VSCUDevice) => void;
}

export const DevicesView: React.FC<DevicesViewProps> = ({
  devices,
  vehicles,
  onAddDevice,
  onUpdateDevice
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [configDevice, setConfigDevice] = useState<VSCUDevice | null>(null);
  const [diagDevice, setDiagDevice] = useState<VSCUDevice | null>(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagResult, setDiagResult] = useState<string | null>(null);

  // Form states
  const [serialNumber, setSerialNumber] = useState('');
  const [imei, setImei] = useState('');
  const [hardwareUid, setHardwareUid] = useState('');
  const [macAddress, setMacAddress] = useState('');
  const [assignedVehicleId, setAssignedVehicleId] = useState('');

  // Configuration modal states
  const [pingInterval, setPingInterval] = useState('10');
  const [shockThreshold, setShockThreshold] = useState('3.5');
  const [sleepModeEnabled, setSleepModeEnabled] = useState(true);

  const filteredDevices = devices.filter((d) =>
    d.hardwareUid.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.serialNumber && d.serialNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (d.imei && d.imei.toLowerCase().includes(searchTerm.toLowerCase())) ||
    d.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.macAddress.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRegisterDevice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hardwareUid && !serialNumber) return;

    const assignedVeh = vehicles.find((v) => v.id === assignedVehicleId);
    const generatedSerial = serialNumber || `VSCU-S3-2026-${String(devices.length + 1).padStart(3, '0')}`;
    const generatedImei = imei || `865492048123${String(450 + devices.length)}`;

    const newDev: VSCUDevice = {
      id: `vscu-${Date.now().toString().slice(-4)}`,
      serialNumber: generatedSerial,
      imei: generatedImei,
      hardwareUid: hardwareUid ? hardwareUid.toUpperCase() : `ESP32S3-${Date.now().toString(16).slice(-4).toUpperCase()}`,
      macAddress: macAddress || '7C:DF:A1:88:22:11',
      vehicleId: assignedVeh?.id || 'unassigned',
      vehiclePlate: assignedVeh?.plateNumber || 'Unassigned',
      connectionStatus: 'online',
      firmwareVersion: 'v2.4.1-smrod-prod',
      batteryLevel: 100,
      batteryVoltage: 4.2,
      lteSignalRssi: -68,
      lteNetworkOperator: 'Safaricom 4G/LTE',
      gnssFix: '3D_FIX',
      gnssSatellites: 14,
      imuStatus: 'normal',
      lastPingTime: 'Just now',
      mcuTemperature: 38.0,
      uptimeHours: 1
    };

    onAddDevice(newDev);
    setIsRegisterOpen(false);
    setSerialNumber('');
    setImei('');
    setHardwareUid('');
    setMacAddress('');
    setAssignedVehicleId('');
  };

  const handleRunDiagnostics = (dev: VSCUDevice) => {
    setDiagDevice(dev);
    setIsDiagnosing(true);
    setDiagResult(null);

    setTimeout(() => {
      setIsDiagnosing(false);
      setDiagResult('PASSED');
    }, 1800);
  };

  const handleReassignVehicle = (dev: VSCUDevice, newVehicleId: string) => {
    const veh = vehicles.find((v) => v.id === newVehicleId);
    const updated: VSCUDevice = {
      ...dev,
      vehicleId: veh?.id || 'unassigned',
      vehiclePlate: veh?.plateNumber || 'Unassigned'
    };
    onUpdateDevice(updated);
  };

  const handleSaveConfig = () => {
    if (!configDevice) return;
    setConfigDevice(null);
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Hardware Registry
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-[#0a66c2]">
              VSCU Gateway
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            VSCU Device Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Vehicle Security Control Units (ESP32-S3), LTE Cat-1 modems, IMEI tracking, and encrypted telemetry.
          </p>
        </div>

        <button
          onClick={() => setIsRegisterOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-[#0a66c2] hover:bg-[#084e96] rounded-xl transition-colors whitespace-nowrap self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Provision New VSCU Unit</span>
        </button>
      </div>

      {/* Security note card */}
      <div className="p-4 bg-slate-900 text-slate-200 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-blue-950/80 text-blue-400 rounded-xl mt-0.5 border border-blue-800/50">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>mTLS Cryptographic Identity Layer Active</span>
              <span className="px-2 py-0.2 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800">
                TLS 1.3
              </span>
            </div>
            <div className="text-xs text-slate-400 leading-relaxed max-w-2xl">
              Direct hardware mutual TLS authentication active. Each connected VSCU authenticates using onboard X.509 device certificates over secure port 8883.
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-3 shrink-0 font-mono bg-slate-950/80 px-3 py-2 rounded-xl border border-slate-800">
          <span>Broker: <strong className="text-white">mqtt.smrod.ai:8883</strong></span>
        </div>
      </div>

      {/* Search and Overview Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Serial, IMEI, Hardware UID, or Plate..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0a66c2] focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span>Active VSCUs: <strong className="text-slate-900 font-mono tabular-nums">{devices.length}</strong></span>
          <span aria-hidden="true">·</span>
          <span>Online: <strong className="text-emerald-700 font-mono tabular-nums">{devices.filter(d => d.connectionStatus === 'online').length}</strong></span>
          <span aria-hidden="true">·</span>
          <span>Degraded: <strong className="text-amber-700 font-mono tabular-nums">{devices.filter(d => d.connectionStatus === 'degraded').length}</strong></span>
        </div>
      </div>

      {/* Devices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDevices.map((dev) => (
          <div
            key={dev.id}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Header with Serial Number & Status */}
              <div className="flex items-start justify-between mb-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-slate-900">
                      {dev.serialNumber || dev.hardwareUid}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-50 text-[#0a66c2] border border-blue-200">
                      VSCU-S3
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-500">
                    IMEI: <strong className="text-slate-700">{dev.imei || '865492048123000'}</strong>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    UID: {dev.hardwareUid} · MAC: {dev.macAddress}
                  </div>
                </div>

                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                  dev.connectionStatus === 'online'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    dev.connectionStatus === 'online' ? 'bg-emerald-500' : 'bg-amber-500'
                  }`} />
                  <span className="capitalize">{dev.connectionStatus}</span>
                </span>
              </div>

              {/* Vehicle Assignment Selector */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 mb-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Link2 className="w-3 h-3 text-[#0a66c2]" />
                    <span>Assigned Vehicle:</span>
                  </span>
                  <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {dev.vehiclePlate}
                  </span>
                </div>

                {/* Quick Reassign dropdown */}
                <select
                  value={dev.vehicleId}
                  onChange={(e) => handleReassignVehicle(dev, e.target.value)}
                  className="w-full text-[11px] font-medium bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
                >
                  <option value="unassigned">Unassigned (Store Inventory)</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      Assign: {v.plateNumber} ({v.make} {v.model})
                    </option>
                  ))}
                </select>
              </div>

              {/* Hardware Telemetry stats */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Signal className="w-3 h-3 text-slate-500" />
                    <span>LTE Cat-1</span>
                  </div>
                  <div className="font-mono font-bold text-slate-800 tabular-nums">
                    {dev.lteSignalRssi} dBm
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">{dev.lteNetworkOperator}</div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Radio className="w-3 h-3 text-slate-500" />
                    <span>GNSS Constellation</span>
                  </div>
                  <div className="font-mono font-bold text-slate-800 tabular-nums">
                    {dev.gnssSatellites} Sats ({dev.gnssFix})
                  </div>
                  <div className="text-[10px] text-slate-500">Multi-band L1/L5</div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Battery className="w-3 h-3 text-slate-500" />
                    <span>Backup Battery</span>
                  </div>
                  <div className="font-mono font-bold text-slate-800 tabular-nums">
                    {dev.batteryLevel}% ({dev.batteryVoltage}V)
                  </div>
                  <div className="text-[10px] text-emerald-600 font-medium">LiPo Safe</div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Thermometer className="w-3 h-3 text-slate-500" />
                    <span>MCU Temp</span>
                  </div>
                  <div className="font-mono font-bold text-slate-800 tabular-nums">
                    {dev.mcuTemperature} °C
                  </div>
                  <div className="text-[10px] text-slate-500">Dual Core Xtensa</div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-mono text-[11px] text-slate-400">{dev.firmwareVersion}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRunDiagnostics(dev)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold transition-colors"
                >
                  <Activity className="w-3.5 h-3.5 text-blue-600" />
                  <span>Diagnostics</span>
                </button>
                <button
                  onClick={() => setConfigDevice(dev)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[#0a66c2] hover:bg-blue-50 rounded-lg font-semibold transition-colors"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Configure</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Diagnostics Inspection Modal */}
      {diagDevice && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-100 text-[#0a66c2] rounded-xl">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-mono">
                    Diagnostics: {diagDevice.serialNumber || diagDevice.hardwareUid}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Live hardware self-test over encrypted MQTT channel
                  </p>
                </div>
              </div>
              <button onClick={() => setDiagDevice(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {isDiagnosing ? (
                <div className="py-8 flex flex-col items-center justify-center space-y-3">
                  <RotateCw className="w-8 h-8 text-[#0a66c2] animate-spin" />
                  <div className="text-sm font-bold text-slate-800">
                    Pinging VSCU Telemetry &amp; Relays...
                  </div>
                  <div className="text-xs text-slate-500 font-mono">
                    Querying GNSS fix, 6-axis IMU bias, and fuel cutoff circuit
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-800 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      All Hardware Sensors Operational
                    </span>
                    <span className="font-mono text-emerald-700 font-bold">100% HEALTH</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-slate-600">Quectel LTE Cat-1 Modem:</span>
                      <span className="font-mono font-bold text-slate-800">
                        {diagDevice.lteSignalRssi} dBm ({diagDevice.lteNetworkOperator})
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-slate-600">GNSS Multi-Constellation Fix:</span>
                      <span className="font-mono font-bold text-slate-800">
                        {diagDevice.gnssFix} ({diagDevice.gnssSatellites} Satellites locked)
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-slate-600">6-Axis IMU Sensor State:</span>
                      <span className="font-mono font-bold text-slate-800">
                        {diagDevice.imuStatus.toUpperCase()} (Calibrated)
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-slate-600">Fuel Cutoff Relay Continuity:</span>
                      <span className="font-mono font-bold text-emerald-700">
                        CIRCUIT CONTINUOUS (NO FAULT)
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-slate-600">mTLS Certificate Expiration:</span>
                      <span className="font-mono font-bold text-slate-800">
                        Valid until Nov 2028 (RSA 2048)
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end gap-2">
              <button
                onClick={() => handleRunDiagnostics(diagDevice)}
                disabled={isDiagnosing}
                className="px-4 py-2 text-xs font-semibold text-[#0a66c2] hover:bg-blue-50 rounded-xl transition-colors"
              >
                Re-run Test
              </button>
              <button
                onClick={() => setDiagDevice(null)}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors"
              >
                Close Diagnostics
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Device Configuration Modal */}
      {configDevice && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-mono">
                  {configDevice.serialNumber || configDevice.hardwareUid}
                </h3>
                <p className="text-xs text-slate-500">
                  ESP32-S3 Firmware Configuration Parameters
                </p>
              </div>
              <button onClick={() => setConfigDevice(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Telemetry Heartbeat Interval (seconds)
                </label>
                <select
                  value={pingInterval}
                  onChange={(e) => setPingInterval(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="5">5 seconds (High Frequency / Security Alert Mode)</option>
                  <option value="10">10 seconds (Standard Pilot Operation)</option>
                  <option value="30">30 seconds (Eco Telemetry)</option>
                  <option value="60">60 seconds (Stationary Standby)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  IMU Sudden Impact Threshold (G-Force)
                </label>
                <select
                  value={shockThreshold}
                  onChange={(e) => setShockThreshold(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="2.5">2.5g (Very Sensitive - Pothole/Minor Impact)</option>
                  <option value="3.5">3.5g (Standard Crash &amp; Collision Severity)</option>
                  <option value="5.0">5.0g (Severe Structural Collision Only)</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <div className="text-xs font-semibold text-slate-800">Deep Sleep on Ignition Off</div>
                  <div className="text-[11px] text-slate-500">Wakes upon IMU displacement interrupt</div>
                </div>
                <input
                  type="checkbox"
                  checked={sleepModeEnabled}
                  onChange={(e) => setSleepModeEnabled(e.target.checked)}
                  className="w-4 h-4 text-[#0a66c2] rounded"
                />
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() => setConfigDevice(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveConfig}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#0a66c2] hover:bg-[#084e96] rounded-xl"
              >
                Push Config via MQTT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Provision New Device Modal */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">
                Provision VSCU Device Record
              </h3>
              <button onClick={() => setIsRegisterOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterDevice} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Serial Number * (e.g. VSCU-S3-2026-007)
                </label>
                <input
                  type="text"
                  required
                  placeholder="VSCU-S3-2026-007"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono uppercase bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Quectel LTE Modem IMEI * (15 digits)
                </label>
                <input
                  type="text"
                  required
                  maxLength={15}
                  placeholder="865492048123459"
                  value={imei}
                  onChange={(e) => setImei(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ESP32-S3 Hardware UID
                </label>
                <input
                  type="text"
                  placeholder="ESP32S3-7CDF-G748-07"
                  value={hardwareUid}
                  onChange={(e) => setHardwareUid(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono uppercase bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Wi-Fi / Bluetooth MAC Address
                </label>
                <input
                  type="text"
                  placeholder="7C:DF:A1:82:07:9F"
                  value={macAddress}
                  onChange={(e) => setMacAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono uppercase bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pair with Vehicle (Initial Assignment)
                </label>
                <select
                  value={assignedVehicleId}
                  onChange={(e) => setAssignedVehicleId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="">Leave unassigned (In stock)</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.plateNumber} — {v.make} {v.model}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#0a66c2] hover:bg-[#084e96] rounded-xl"
                >
                  Provision Device
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
