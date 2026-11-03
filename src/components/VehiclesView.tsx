import React, { useState } from 'react';
import { Vehicle, ESP32Device } from '../types/smrod';
import {
  Car,
  Search,
  Filter,
  Plus,
  Shield,
  ShieldAlert,
  Lock,
  Unlock,
  Cpu,
  MapPin,
  Clock,
  Battery,
  Fuel,
  Gauge,
  X,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

interface VehiclesViewProps {
  vehicles: Vehicle[];
  devices: ESP32Device[];
  onUpdateVehicle: (updated: Vehicle) => void;
  onAddVehicle: (newVeh: Vehicle) => void;
  onTriggerImmobilization: (vehicle: Vehicle, targetState: boolean) => void;
  canExecuteCommands: boolean;
}

export const VehiclesView: React.FC<VehiclesViewProps> = ({
  vehicles,
  devices,
  onUpdateVehicle,
  onAddVehicle,
  onTriggerImmobilization,
  canExecuteCommands
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'normal' | 'warning' | 'critical'>('all');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // New vehicle form state
  const [newPlate, setNewPlate] = useState('');
  const [newMake, setNewMake] = useState('Toyota');
  const [newModel, setNewModel] = useState('');
  const [newYear, setNewYear] = useState('2024');
  const [newVin, setNewVin] = useState('');
  const [newOwner, setNewOwner] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newDeviceId, setNewDeviceId] = useState('');

  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch =
      v.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || v.securityStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlate || !newModel || !newVin) return;

    const newVehicle: Vehicle = {
      id: `veh-${Date.now().toString().slice(-4)}`,
      plateNumber: newPlate.toUpperCase(),
      vin: newVin.toUpperCase(),
      make: newMake,
      model: newModel,
      year: parseInt(newYear) || 2024,
      color: 'Standard Fleet White',
      ownerName: newOwner || 'Corporate Fleet',
      ownerEmail: 'ops@smrod.ai',
      ownerPhone: newPhone || '+254 700 000 000',
      deviceId: newDeviceId || `esp-${Date.now().toString().slice(-4)}`,
      status: 'active',
      securityStatus: 'normal',
      isImmobilized: false,
      currentSpeed: 0,
      isMoving: false,
      hasIncident: false,
      heading: 0,
      latitude: -1.286389,
      longitude: 36.817223,
      lastLocationTime: 'Just registered',
      batteryVoltage: 12.8,
      fuelLevel: 100,
      odometerKm: 0
    };

    onAddVehicle(newVehicle);
    setIsRegisterOpen(false);
    // Reset form
    setNewPlate('');
    setNewModel('');
    setNewVin('');
    setNewOwner('');
  };

  return (
    <div className="space-y-6">
      {/* Header and Action Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Pilot Fleet Asset Registry
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Vehicle Management
          </h1>
        </div>

        <button
          onClick={() => setIsRegisterOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors whitespace-nowrap self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Register New Vehicle</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search plate number, make, model, or owner..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all"
          />
        </div>

        {/* Segmented Filter Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-full sm:w-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({vehicles.length})
          </button>
          <button
            onClick={() => setStatusFilter('normal')}
            className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              statusFilter === 'normal' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Normal ({vehicles.filter(v => v.securityStatus === 'normal').length})
          </button>
          <button
            onClick={() => setStatusFilter('warning')}
            className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              statusFilter === 'warning' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Warning ({vehicles.filter(v => v.securityStatus === 'warning').length})
          </button>
          <button
            onClick={() => setStatusFilter('critical')}
            className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              statusFilter === 'critical' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Critical ({vehicles.filter(v => v.securityStatus === 'critical').length})
          </button>
        </div>
      </div>

      {/* Vehicles Data Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                <th className="py-3 px-4">Registration</th>
                <th className="py-3 px-4">Vehicle Specs</th>
                <th className="py-3 px-4">Owner / Fleet</th>
                <th className="py-3 px-4">Assigned ESP32</th>
                <th className="py-3 px-4">Security Status</th>
                <th className="py-3 px-4">Engine State</th>
                <th className="py-3 px-4">Speed</th>
                <th className="py-3 px-4">Last Update</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVehicles.map((veh) => {
                const assignedDevice = devices.find((d) => d.id === veh.deviceId);
                return (
                  <tr
                    key={veh.id}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                    onClick={() => setSelectedVehicle(veh)}
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-slate-900 text-sm">{veh.plateNumber}</div>
                      <div className="font-mono text-[11px] text-slate-400">VIN: {veh.vin}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{veh.make} {veh.model}</div>
                      <div className="text-[11px] text-slate-500">{veh.year} · {veh.color}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{veh.ownerName}</div>
                      <div className="text-[11px] text-slate-500">{veh.ownerPhone}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-mono text-slate-700">{assignedDevice ? assignedDevice.hardwareUid : veh.deviceId}</div>
                      <div className="text-[11px] text-emerald-600 font-medium">
                        {assignedDevice?.connectionStatus || 'connected'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 font-semibold uppercase text-[11px] px-2 py-0.5 rounded ${
                        veh.securityStatus === 'critical'
                          ? 'bg-red-50 text-red-700 border border-red-200/60'
                          : veh.securityStatus === 'warning'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                      }`}>
                        {veh.securityStatus === 'critical' && <ShieldAlert className="w-3 h-3" />}
                        {veh.securityStatus === 'warning' && <AlertTriangle className="w-3 h-3" />}
                        {veh.securityStatus === 'normal' && <Shield className="w-3 h-3" />}
                        <span>{veh.securityStatus}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {veh.isImmobilized ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-[11px] text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                          <Lock className="w-3 h-3" />
                          <span>Immobilized</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-600 font-medium">
                          Active / Normal
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono tabular-nums text-slate-700 font-medium">
                      {veh.currentSpeed} km/h
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {veh.lastLocationTime}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedVehicle(veh);
                        }}
                        className="text-indigo-600 hover:text-indigo-900 font-semibold text-xs"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vehicle Inspection Detail Modal */}
      {selectedVehicle && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-800">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 font-mono">
                      {selectedVehicle.plateNumber}
                    </h3>
                    <span className={`text-[11px] px-2 py-0.5 rounded font-semibold uppercase ${
                      selectedVehicle.securityStatus === 'critical' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {selectedVehicle.securityStatus}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model} ({selectedVehicle.color})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedVehicle(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto">
              {/* Telemetry Snapshot Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-[11px] text-slate-500 flex items-center gap-1 mb-1">
                    <Gauge className="w-3.5 h-3.5" />
                    <span>Speed</span>
                  </div>
                  <div className="text-lg font-mono font-bold text-slate-900 tabular-nums">
                    {selectedVehicle.currentSpeed} km/h
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-[11px] text-slate-500 flex items-center gap-1 mb-1">
                    <Battery className="w-3.5 h-3.5" />
                    <span>Battery</span>
                  </div>
                  <div className="text-lg font-mono font-bold text-slate-900 tabular-nums">
                    {selectedVehicle.batteryVoltage} V
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-[11px] text-slate-500 flex items-center gap-1 mb-1">
                    <Fuel className="w-3.5 h-3.5" />
                    <span>Fuel Level</span>
                  </div>
                  <div className="text-lg font-mono font-bold text-slate-900 tabular-nums">
                    {selectedVehicle.fuelLevel || 75}%
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-[11px] text-slate-500 flex items-center gap-1 mb-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Odometer</span>
                  </div>
                  <div className="text-lg font-mono font-bold text-slate-900 tabular-nums">
                    {selectedVehicle.odometerKm.toLocaleString()} km
                  </div>
                </div>
              </div>

              {/* Hardware & Owner Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
                  <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-indigo-600" />
                    <span>Assigned IoT Hardware</span>
                  </div>
                  <div className="text-xs space-y-1 font-mono text-slate-600">
                    <div>UID: <span className="text-slate-900 font-bold">{selectedVehicle.deviceId}</span></div>
                    <div>Model: ESP32-S3 WROOM (LTE/GNSS)</div>
                    <div>Firmware: v2.4.1-smrod-prod</div>
                    <div>Mutual TLS: Active &amp; Verified</div>
                  </div>
                </div>

                <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
                  <div className="text-xs font-semibold text-slate-700">
                    Registered Owner &amp; Contact
                  </div>
                  <div className="text-xs space-y-1 text-slate-600">
                    <div>Name: <span className="text-slate-900 font-medium">{selectedVehicle.ownerName}</span></div>
                    <div>Email: {selectedVehicle.ownerEmail}</div>
                    <div>Phone: {selectedVehicle.ownerPhone}</div>
                    <div>VIN: <span className="font-mono text-slate-800">{selectedVehicle.vin}</span></div>
                  </div>
                </div>
              </div>

              {/* Critical Safety Gate: Remote Vehicle Immobilization Control */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Remote Vehicle Immobilization Safety Control</span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Sends encrypted command via MQTT over TLS 1.3 to the vehicle fuel relay circuit.
                    </p>
                  </div>

                  <span className={`text-xs font-bold px-2 py-0.5 rounded font-mono ${
                    selectedVehicle.isImmobilized ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {selectedVehicle.isImmobilized ? 'IMMOBILIZED' : 'MOBILIZED'}
                  </span>
                </div>

                {/* Safety Warning */}
                <div className="text-xs text-slate-600 flex items-start gap-2 bg-white p-3 rounded-lg border border-slate-200">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Safety Interlock Protocol:</strong> Remote engine cut-off commands require vehicle velocity to be below 5 km/h to prevent dangerous highway shutdowns. Current speed: <strong className="font-mono">{selectedVehicle.currentSpeed} km/h</strong>.
                  </span>
                </div>

                <div className="flex items-center justify-end gap-3 pt-1">
                  {selectedVehicle.isImmobilized ? (
                    <button
                      disabled={!canExecuteCommands}
                      onClick={() => {
                        onTriggerImmobilization(selectedVehicle, false);
                        setSelectedVehicle({ ...selectedVehicle, isImmobilized: false });
                      }}
                      className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Restore Engine Ignition (Mobilize)</span>
                    </button>
                  ) : (
                    <button
                      disabled={!canExecuteCommands || selectedVehicle.currentSpeed > 5}
                      onClick={() => {
                        onTriggerImmobilization(selectedVehicle, true);
                        setSelectedVehicle({ ...selectedVehicle, isImmobilized: true });
                      }}
                      className={`px-4 py-2 text-xs font-semibold text-white rounded-lg transition-colors flex items-center gap-1.5 ${
                        selectedVehicle.currentSpeed > 5 || !canExecuteCommands
                          ? 'bg-slate-400 cursor-not-allowed'
                          : 'bg-red-600 hover:bg-red-700'
                      }`}
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Execute Remote Immobilization</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedVehicle(null)}
                className="px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vehicle Registration Modal */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">
                Register Pilot Vehicle
              </h3>
              <button onClick={() => setIsRegisterOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Plate Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. KDP 892B"
                  value={newPlate}
                  onChange={(e) => setNewPlate(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono uppercase bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Make *</label>
                  <select
                    value={newMake}
                    onChange={(e) => setNewMake(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                  >
                    <option value="Toyota">Toyota</option>
                    <option value="Hyundai">Hyundai</option>
                    <option value="Mercedes-Benz">Mercedes-Benz</option>
                    <option value="Isuzu">Isuzu</option>
                    <option value="Nissan">Nissan</option>
                    <option value="Ford">Ford</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Model *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Land Cruiser"
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Year</label>
                  <input
                    type="number"
                    value={newYear}
                    onChange={(e) => setNewYear(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">VIN / Chassis *</label>
                  <input
                    type="text"
                    required
                    placeholder="17-char VIN"
                    value={newVin}
                    onChange={(e) => setNewVin(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono uppercase bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assign ESP32-S3 Device</label>
                <select
                  value={newDeviceId}
                  onChange={(e) => setNewDeviceId(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <option value="">Auto-generate new ESP32 registration record</option>
                  {devices.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.hardwareUid} (Assigned to {d.vehiclePlate})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Owner Name</label>
                  <input
                    type="text"
                    placeholder="Owner / Organization"
                    value={newOwner}
                    onChange={(e) => setNewOwner(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+254 7..."
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                >
                  Register Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
