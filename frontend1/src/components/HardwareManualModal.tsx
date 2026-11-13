import React, { useRef } from 'react';
import {
  Printer,
  Download,
  X,
  Cpu,
  Zap,
  ShieldAlert,
  Radio,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Server,
  Activity,
  Maximize2
} from 'lucide-react';

interface HardwareManualModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HardwareManualModal: React.FC<HardwareManualModalProps> = ({
  isOpen,
  onClose
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadMarkdown = () => {
    const markdownContent = `# SMROD-AIOT VEHICLE SECURITY & CONTROL UNIT (VSCU)
## COMPLETE SYSTEM ARCHITECTURE & PHYSICAL HARDWARE ENGINEERING SPECIFICATION
**Document Reference:** SMROD-ENG-DOC-V2.4  
**Classification:** Confidential / Production Specification  
**Target Platform:** ESP32-S3 + Quectel EC200U-EU + LSM6DS3 + Supabase + Flutter + Django  

---

### 1. SYSTEM OVERVIEW & ARCHITECTURE
The SMROD AIoT platform is an enterprise-grade vehicle security, telematics, and autonomous immobilization ecosystem. It provides real-time vehicle telemetry, sub-second security event detection, edge-AI crash and rollover detection, and tamper-proof remote vehicle mobilization/immobilization.

#### End-to-End System Data Flow:
1. **Physical Onboard Unit (VSCU):** Installed in vehicle behind dashboard. Gathers GNSS coordinates, ACC ignition status, 6-axis IMU forces, CAN-bus telemetry, and vehicle main battery voltage.
2. **Encrypted Cellular Uplink:** VSCU transmits via Quectel EC200U LTE Cat-1 over TLS 1.3 / mTLS to the enterprise MQTT Broker (EMQX).
3. **Cloud Backend & Database:** Django Telemetry workers ingest packets and persist real-time records into Supabase PostgreSQL (\`vehicles\`, \`security_events\`, \`telemetry_history\`, \`remote_commands\`).
4. **Real-Time Client Synchronization:** Supabase Realtime WebSocket engine broadcasts record changes to the Admin Web Operations Center and Flutter Mobile App in <50ms.
5. **Robotic Voice & Safety Interlocks:** When critical security events occur or remote commands are executed, the system dispatches audible robotic synthesized voice confirmations to operators and drivers while enforcing vehicle speed < 5 km/h safety gates before fuel pump relay actuation.

---

### 2. PHYSICAL HARDWARE SPECIFICATION (VSCU BOARD)

#### 2.1 Microcontroller Subsystem
- **Core Unit:** ESP32-S3-WROOM-1-N16R8 (Espressif Systems)
- **Processor:** Xtensa® 32-bit LX7 dual-core running up to 240 MHz
- **Memory:** 16 MB SPI Flash, 8 MB Octal PSRAM (for buffering telemetry during cellular dead zones)
- **Wireless Fallback:** 2.4 GHz Wi-Fi 4 (802.11 b/g/n) and Bluetooth 5.0 (LE) for depot diagnostics and technician pairing.

#### 2.2 Automotive Power Supply & Protection Circuit
- **Vehicle Input Range:** 9V DC to 36V DC nominal (compatible with 12V passenger cars and 24V commercial trucks).
- **Automotive Transient Suppression:**
  - Resettable PPTC Fuse (2.0A, 60V)
  - Bidirectional TVS Diode: SMBJ36CA (protects against ISO 7637-2 load-dump spikes up to 60V)
  - P-Channel MOSFET (AO3401A) or Schottky diode (SS34) for reverse polarity protection.
- **Primary Step-Down DC-DC Buck Regulator:**
  - IC: Monolithic Power MP2451 or Texas Instruments TPS54302 (high-efficiency switching buck)
  - Output: 3.8V DC @ 2.5A peak (specifically tuned for Quectel LTE Cat-1 RF transmission burst currents).
- **Secondary Low-Dropout (LDO) Regulator:**
  - IC: ME6211C33 or AMS1117-3.3
  - Output: 3.3V DC @ 600mA (clean, low-ripple rail powering ESP32-S3, IMU, and optocouplers).
- **Internal Backup Battery & Power Path Management:**
  - Battery: 3.7V 1200mAh Rechargeable Li-Polymer (LiPo) cell.
  - Charging IC: TP4056 or BQ24074 with automatic dynamic power path management.
  - Fail-over: If vehicle 12V battery is disconnected by car thieves, power path IC instantly switches to the 3.7V LiPo without system reboot, triggering a High-Priority "Main Battery Tamper / Cut" security event.
  - Battery Gauge: Resistor divider (100kΩ / 100kΩ) connected to ESP32-S3 ADC1 (GPIO4) to report internal battery percentage.

#### 2.3 Cellular Communication & GNSS Positioning Module
- **Module:** Quectel EC200U-EU (LTE Cat-1 + Multi-Constellation GNSS)
- **Cellular Speeds:** LTE-FDD Max 10Mbps (DL) / 5Mbps (UL)
- **Bands Supported:** B1/B3/B5/B7/B8/B20/B28 (Worldwide & EMEA coverage)
- **GNSS Engine:** Integrated GPS, GLONASS, BeiDou, Galileo, QZSS
- **Positioning Accuracy:** < 2.5m CEP, Cold start < 35s, Hot start < 1s
- **Interfaces:** AT-Command UART (GPIO17 TX, GPIO18 RX) @ 115200 baud, Hardware Power Key (GPIO16), Reset (GPIO2).

#### 2.4 Sensor Subsystem & Vehicle Interfaces
- **6-Axis Motion / IMU Sensor:**
  - IC: STMicroelectronics LSM6DS3TR-C or TDK MPU6050
  - Bus: I2C (GPIO21 SDA, GPIO22 SCL @ 400kHz)
  - Interrupt Line: INT1 connected to ESP32-S3 GPIO3.
  - Edge AI Detection: Configured with 104Hz high-rate ODR, ±16g range for sub-10ms crash impact detection, and 6D orientation orientation for vehicle rollover (>60°) & unauthorized towing.
- **Vehicle Ignition Detection (ACC Sense):**
  - Circuit: PC817 Optocoupler isolating vehicle 12V/24V ACC wire to 3.3V digital logic (GPIO5).
  - Logic: HIGH (3.3V) = Ignition ON; LOW (0V) = Ignition OFF.
- **Enclosure Tamper Switch:**
  - Normally closed microswitch connected to GPIO6 with internal 10k pull-up. Opening the physical casing asserts an immediate tamper security interrupt.
- **Vehicle Main Battery Voltage Monitor:**
  - Resistor divider (100kΩ / 10kΩ) connected to ESP32-S3 ADC1 (GPIO1) reading 0-36V scaled to 0-3.3V.

#### 2.5 Actuation & Immobilizer Relay Circuit
- **Immobilizer Relay:**
  - Relays: 12V 30A / 40A Automotive Relay (Songle SLA / JD1914).
  - Driver: AO3400 N-channel MOSFET driven by ESP32-S3 GPIO7 via 1kΩ gate resistor with 10kΩ pull-down.
  - Protection: 1N4007 flyback suppression diode across relay coil.
  - Safety Wiring: Wired in **Normally Closed (NC)** configuration through vehicle fuel pump relay or starter circuit.
  - Fail-Safe Rationale: If the VSCU loses total power while driving on a highway, the relay remains DE-ENERGIZED (contacts closed), preventing dangerous engine cutoffs at high speed.
  - Remote Mobilization: Energizing the relay breaks the fuel pump circuit, immobilizing the vehicle safely.
- **Speed Interlock Safety Gate (Firmware):**
  - Relay actuation is locked out unless GNSS Speed is verified to be < 5 km/h for 3 consecutive seconds, or vehicle ignition (ACC) is OFF.
- **Audible Siren / Buzzer Driver:**
  - NPN / MOSFET circuit driving 5V/12V piezo alarm siren on GPIO15.

---

### 3. ESP32-S3 HARDWARE PINOUT TABLE
| GPIO Pin | Signal Name | Direction | Voltage | Interfacing Component / Purpose |
|----------|-------------|-----------|---------|---------------------------------|
| GPIO1    | VEH_BAT_ADC | Input     | 0-3.3V  | 12V/24V Car Battery Resistor Divider (100k/10k) |
| GPIO2    | LTE_RESET   | Output    | 3.3V    | Quectel EC200U Hardware Reset |
| GPIO3    | IMU_INT1    | Input/Ext | 3.3V    | LSM6DS3 Crash/Towing Motion Interrupt (Active High) |
| GPIO4    | LIPO_BAT_ADC| Input     | 0-3.3V  | 3.7V Backup LiPo Battery Resistor Divider |
| GPIO5    | ACC_SENSE   | Input     | 3.3V    | PC817 Optocoupler Isolated 12V Ignition Line |
| GPIO6    | TAMPER_SW   | Input     | 3.3V    | Casing Enclosure Microswitch (Active Low) |
| GPIO7    | RELAY_KILL  | Output    | 3.3V    | AO3400 MOSFET Driving 12V Fuel Cutoff Relay |
| GPIO8    | SOS_BUTTON  | Input     | 3.3V    | Emergency Driver SOS Panic Button (Debounced) |
| GPIO12   | LED_STATUS  | Output    | 3.3V    | Red LED: Armed / Alarm / Tamper State |
| GPIO13   | LED_NET     | Output    | 3.3V    | Green LED: Cellular LTE Registered & MQTT Online |
| GPIO14   | LED_GPS     | Output    | 3.3V    | Blue LED: GNSS 3D Satellite Fix Acquired |
| GPIO15   | BUZZER_OUT  | Output    | 3.3V    | Piezo Siren / Warning Chirp Transistor |
| GPIO16   | LTE_PWRKEY  | Output    | 3.3V    | Quectel EC200U Power Key Pulse (>100ms) |
| GPIO17   | UART_TXD1   | Output    | 3.3V    | AT Commands & PPP to Quectel EC200U RXD |
| GPIO18   | UART_RXD1   | Input     | 3.3V    | AT Commands & PPP from Quectel EC200U TXD |
| GPIO19   | CAN_TX      | Output    | 3.3V    | SN65HVD230 CAN Bus Transceiver (OBD-II TX) |
| GPIO20   | CAN_RX      | Input     | 3.3V    | SN65HVD230 CAN Bus Transceiver (OBD-II RX) |
| GPIO21   | I2C_SDA     | Bidirec   | 3.3V    | LSM6DS3TR-C 6-Axis IMU Data Line (4.7k Pull-up) |
| GPIO22   | I2C_SCL     | Output    | 3.3V    | LSM6DS3TR-C 6-Axis IMU Clock Line (4.7k Pull-up) |

---

### 4. FIRMWARE ARCHITECTURE (FREERTOS ON ESP32-S3)
The VSCU runs an ESP-IDF FreeRTOS multitasking architecture across both Xtensa LX7 cores:
- **Core 0 (Networking & Uplink):**
  - \`vTaskCellular\`: Manages Quectel EC200U AT socket & PPP link, signal quality (CSQ), and network registration.
  - \`vTaskMQTT\`: Handles bidirectional TLS 1.3 telemetry publishing and command topic subscription (\`smrod/v1/devices/{uid}/cmd\`).
- **Core 1 (Real-Time Sensing & Safety Control):**
  - \`vTaskIMU\`: Samples 6-axis accelerometer & gyroscope at 100Hz, executes edge AI rollover and peak impact calculus.
  - \`vTaskGNSS\`: Parses NMEA sentences ($GPRMC, $GPGGA) extracting latitude, longitude, speed, heading, and HDOP.
  - \`vTaskSafetyRelay\`: Enforces vehicle speed interlock before executing immobilize commands.

---

### 5. CLOUD TELEMETRY & SUPABASE REALTIME
- **Topic:** \`smrod/v1/devices/{device_id}/telemetry\` (Published every 10 seconds while ignition ON, every 300 seconds in parked sleep mode).
- **Security Event QoS 1 Topic:** \`smrod/v1/devices/{device_id}/events\` (Dispatched in <200ms upon crash, unauthorized towing, geofence exit, or battery cut).
- **PostgreSQL Tables:** \`vehicles\`, \`security_events\`, \`remote_commands\`, \`audit_logs\`.
- **Client Synchronization:** Supabase Realtime WebSocket engine syncs database state to Flutter Mobile and Admin Web in real time.

---
**Verified for Production Deployment**  
*SMROD AIoT Automotive Engineering Team*
`;

    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'SMROD_VSCU_Hardware_System_Manual_V2.4.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="print:hidden flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                SMROD System Architecture &amp; Hardware Manual
                <span className="text-[10px] font-mono px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded border border-blue-400/30">
                  PRINTABLE PDF READY
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                End-to-End System Manual &amp; Physical VSCU (ESP32-S3) Automotive Blueprint
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadMarkdown}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors"
              title="Download Markdown Documentation"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export .MD</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-sm transition-colors cursor-pointer"
              title="Print document or save as PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Document Content */}
        <div
          ref={printRef}
          className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 text-slate-800 font-sans leading-relaxed print:p-0 print:overflow-visible print:text-black"
        >
          {/* Printable Document Header */}
          <div className="border-b-2 border-slate-900 pb-6">
            <div className="flex justify-between items-start gap-4">
              <div>
                <span className="text-xs font-bold font-mono tracking-widest text-blue-700 uppercase">
                  CONFIDENTIAL TECHNICAL SPECIFICATION &bull; SMROD-ENG-DOC-V2.4
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 mt-1 tracking-tight">
                  SMROD AIoT Fleet &amp; Vehicle Security Control Unit (VSCU)
                </h1>
                <p className="text-sm text-slate-600 font-medium mt-1">
                  Complete System Working Specification &amp; Embedded Hardware Engineering Blueprint
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="inline-block px-3 py-1 bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold rounded">
                  REV 2.4 / AUTOMOTIVE GRADE
                </span>
                <p className="text-[11px] text-slate-500 font-mono mt-1">
                  Date: {new Date().toISOString().split('T')[0]}
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 1: HOW THE WHOLE SYSTEM WORKS */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <Layers className="w-5 h-5 text-blue-700" />
              <h2 className="text-lg font-bold text-slate-900">
                1. System Working Overview &amp; End-to-End Dataflow
              </h2>
            </div>
            <p className="text-xs text-slate-700 leading-normal">
              The SMROD AIoT ecosystem operates as a dual-layer decoupled architecture separating real-time telematics ingestion from operator user interaction. The vehicle's onboard physical VSCU device continuously monitors onboard vehicle status, evaluates physical sensor anomalies via edge-AI, and syncs bidirectionally with the cloud.
            </p>

            {/* Architecture Flow Diagram Box */}
            <div className="p-4 bg-slate-950 text-slate-100 rounded-xl font-mono text-[11px] leading-relaxed overflow-x-auto shadow-inner">
              <pre>{`[ PHYSICAL VEHICLE ]
  │── 12V/24V ACC Ignition Line ──> PC817 Optocoupler Isolation
  │── Fuel Pump / Starter Wire  ──> AO3400 N-MOSFET + 12V 30A NC Relay (Immobilizer)
  │── OBD-II CAN-Bus (H / L)    ──> SN65HVD230 3.3V CAN Transceiver
  │── 6-Axis Motion / Impacts   ──> LSM6DS3TR-C IMU (I2C & INT1 Hardware Crash Wakeup)
  │── External 12V Main Battery ──> TVS Diode + PPTC + MP2451 Buck Regulator (3.8V)
  └── Backup 3.7V 1200mAh LiPo  ──> TP4056 Auto-Switchover Power Path
                                         │
                                         ▼
                     [ ESP32-S3-WROOM-1 DUAL-CORE 240MHz ]
                       • Core 0: Quectel EC200U LTE Cat-1 Modem & TLS 1.3 MQTT
                       • Core 1: FreeRTOS 100Hz Sensor Tasks & Fail-Safe Speed Gate (<5 km/h)
                                         │
                          (mTLS / LTE 4G / Cat-1)
                                         ▼
                     [ ENTERPRISE MQTT BROKER (EMQX / TLS) ]
                                         │
                                (Celery Workers)
                                         ▼
               [ SUPABASE POSTGRESQL & REALTIME WEBSOCKET HUB ]
                 • Tables: vehicles, security_events, remote_commands, audit_logs
                 • Instant Database CDC Replication (<50ms)
                                         │
                     ┌───────────────────┴───────────────────┐
                     ▼                                       ▼
        [ ADMIN WEB DASHBOARD ]                   [ FLUTTER MOBILE APP ]
     • Live Map Telemetry                     • Driver SOS Panic Dispatch
     • Speed-Gated Immobilizer Control        • Remote Lock / Engine Cut
     • Web Speech Robotic Voice Audio         • FlutterTTS Robotic Voice Engine`}</pre>
            </div>
          </section>

          {/* SECTION 2: PHYSICAL HARDWARE ARCHITECTURE (VSCU) */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <Cpu className="w-5 h-5 text-blue-700" />
              <h2 className="text-lg font-bold text-slate-900">
                2. Physical Hardware Specification (VSCU PCB &amp; Electronic Components)
              </h2>
            </div>
            <p className="text-xs text-slate-700">
              The physical telematics unit is designed specifically for rugged automotive deployment, complying with ISO 7637-2 transient protection and operating between -40°C and +85°C.
            </p>

            {/* Grid of hardware subsystems */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Power Supply Box */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Zap className="w-4 h-4 text-amber-600" />
                  <span>2.1 Automotive Power Supply &amp; Protection Tree</span>
                </div>
                <ul className="list-disc pl-4 space-y-1 text-slate-600 text-[11px]">
                  <li><strong>Automotive DC Input:</strong> 9V to 36V nominal input range (supports 12V cars and 24V haulage trucks).</li>
                  <li><strong>Transient Surge Suppression:</strong> SMBJ36CA bidirectional TVS diode suppressing load-dump inductive spikes up to 60V.</li>
                  <li><strong>Reverse Polarity &amp; Overcurrent:</strong> 2.0A resettable PPTC fuse + AO3401A P-channel MOSFET reverse protection.</li>
                  <li><strong>Primary DC-DC Buck Converter:</strong> MP2451 / TPS54302 stepping down 9V–36V to 3.8V @ 2.5A peak for Quectel RF cellular bursts.</li>
                  <li><strong>Secondary LDO Regulator:</strong> ME6211C33 (3.8V to 3.3V @ 600mA, ultra-low ripple for ESP32-S3 and analog sensors).</li>
                  <li><strong>Backup Battery Management:</strong> 3.7V 1200mAh LiPo battery paired with TP4056 / BQ24074 charging IC with seamless auto-switching power path.</li>
                </ul>
              </div>

              {/* Cellular & GNSS Box */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Radio className="w-4 h-4 text-blue-600" />
                  <span>2.2 Cellular Modem &amp; Multi-GNSS Subsystem</span>
                </div>
                <ul className="list-disc pl-4 space-y-1 text-slate-600 text-[11px]">
                  <li><strong>Modem Module:</strong> Quectel EC200U-EU (LTE 4G Cat-1, 10 Mbps downlink, 5 Mbps uplink).</li>
                  <li><strong>Cellular Bands:</strong> FDD-LTE B1/B3/B5/B7/B8/B20/B28 with micro-SIM socket and optional eSIM (MFF2) pad footprint.</li>
                  <li><strong>GNSS Engine:</strong> Integrated GPS / GLONASS / BeiDou / Galileo / QZSS receiver (<2.5m CEP accuracy, NMEA-0183 protocol).</li>
                  <li><strong>Antenna Connectors:</strong> Dual IPEX/U.FL to external SMA female connectors (one LTE antenna, one active GNSS antenna with 3.3V LNA phantom feed).</li>
                  <li><strong>Host Interface:</strong> High-speed UART (GPIO17 TXD, GPIO18 RXD) @ 115200 baud, hardware PWRKEY (GPIO16), RESET (GPIO2).</li>
                </ul>
              </div>

              {/* Sensor Subsystem */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <span>2.3 Sensors, ACC Detection &amp; Tamper Switch</span>
                </div>
                <ul className="list-disc pl-4 space-y-1 text-slate-600 text-[11px]">
                  <li><strong>6-Axis Motion / IMU:</strong> ST LSM6DS3TR-C or MPU6050 over I2C (GPIO21 SDA, GPIO22 SCL) with 104Hz ODR and ±16g range.</li>
                  <li><strong>Hardware Crash Wakeup:</strong> INT1 line on GPIO3 provides immediate edge interrupt upon >3.5g impact or vehicle rollover (>60°).</li>
                  <li><strong>Ignition Sensing (ACC):</strong> PC817 optocoupler galvanic isolation circuit converts 12V/24V ignition wire to 3.3V logic on GPIO5.</li>
                  <li><strong>Tamper Microswitch:</strong> Spring-loaded normally-closed switch on GPIO6 detecting unauthorized box enclosure opening.</li>
                  <li><strong>Analog Voltage Divider:</strong> 100kΩ / 10kΩ divider connected to ADC1 (GPIO1) to report 12V vehicle battery health &amp; disconnects.</li>
                </ul>
              </div>

              {/* Actuation & Relay Box */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <ShieldAlert className="w-4 h-4 text-red-600" />
                  <span>2.4 Remote Immobilizer Relay Circuit &amp; Safety Interlock</span>
                </div>
                <ul className="list-disc pl-4 space-y-1 text-slate-600 text-[11px]">
                  <li><strong>Automotive Relay:</strong> 12V 30A/40A JD1914 automotive relay with 1N4007 flyback suppression diode.</li>
                  <li><strong>Transistor Driver:</strong> AO3400 N-channel MOSFET driven by GPIO7 through 1kΩ gate resistor and 10kΩ gate pull-down.</li>
                  <li><strong>Fail-Safe NC Wiring:</strong> Relay is wired across the vehicle fuel pump wire in <strong>Normally Closed (NC)</strong> mode. If the VSCU loses power, the car continues running safely.</li>
                  <li><strong>Safety Gate (Speed Interlock):</strong> Firmware enforces that remote immobilization commands are REJECTED if vehicle GPS speed is &gt; 5 km/h.</li>
                  <li><strong>Acoustic Siren Driver:</strong> Piezo buzzer driver on GPIO15 for warning chirps and armed acoustic deterrent.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* SECTION 3: COMPLETE GPIO PINOUT MATRIX */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <Zap className="w-5 h-5 text-blue-700" />
              <h2 className="text-lg font-bold text-slate-900">
                3. Complete ESP32-S3 Physical GPIO Pinout Matrix
              </h2>
            </div>
            <p className="text-xs text-slate-700">
              The following hardware mapping dictates the physical traces between the ESP32-S3 microcontroller and all peripheral ICs on the VSCU PCB:
            </p>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-200">
                    <th className="p-2.5">GPIO</th>
                    <th className="p-2.5">Signal Identifier</th>
                    <th className="p-2.5">Type</th>
                    <th className="p-2.5">Voltage</th>
                    <th className="p-2.5">Target Peripheral &amp; Hardware Circuit Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700 font-mono text-[11px]">
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-blue-700">GPIO1</td>
                    <td className="p-2.5 font-bold">VEH_BAT_ADC</td>
                    <td className="p-2.5">Analog In</td>
                    <td className="p-2.5">0-3.3V</td>
                    <td className="p-2.5 font-sans">12V/24V Vehicle battery voltage divider (100kΩ / 10kΩ). Detects car battery tampering.</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-blue-700">GPIO2</td>
                    <td className="p-2.5 font-bold">LTE_RESET</td>
                    <td className="p-2.5">Digital Out</td>
                    <td className="p-2.5">3.3V</td>
                    <td className="p-2.5 font-sans">Hardware reset line to Quectel EC200U cellular modem (Active Low).</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-blue-700">GPIO3</td>
                    <td className="p-2.5 font-bold">IMU_INT1</td>
                    <td className="p-2.5">Interrupt In</td>
                    <td className="p-2.5">3.3V</td>
                    <td className="p-2.5 font-sans">LSM6DS3TR-C hardware interrupt (Triggers on &gt;3.5g impact, freefall, or rollover &gt;60°).</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-blue-700">GPIO4</td>
                    <td className="p-2.5 font-bold">LIPO_BAT_ADC</td>
                    <td className="p-2.5">Analog In</td>
                    <td className="p-2.5">0-3.3V</td>
                    <td className="p-2.5 font-sans">3.7V internal LiPo backup battery divider (100kΩ / 100kΩ). Measures backup battery %.</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-blue-700">GPIO5</td>
                    <td className="p-2.5 font-bold">ACC_SENSE</td>
                    <td className="p-2.5">Digital In</td>
                    <td className="p-2.5">3.3V</td>
                    <td className="p-2.5 font-sans">PC817 Optocoupler isolated vehicle ignition signal (HIGH = Engine ON, LOW = Parked).</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-blue-700">GPIO6</td>
                    <td className="p-2.5 font-bold">TAMPER_SW</td>
                    <td className="p-2.5">Digital In</td>
                    <td className="p-2.5">3.3V</td>
                    <td className="p-2.5 font-sans">Internal microswitch detecting physical enclosure opening (Active Low, 10kΩ pull-up).</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-blue-700">GPIO7</td>
                    <td className="p-2.5 font-bold">RELAY_KILL</td>
                    <td className="p-2.5">Digital Out</td>
                    <td className="p-2.5">3.3V</td>
                    <td className="p-2.5 font-sans">AO3400 N-MOSFET gate driver controlling 12V 30A fuel pump relay (HIGH = Cutoff / Immobilized).</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-blue-700">GPIO8</td>
                    <td className="p-2.5 font-bold">SOS_BUTTON</td>
                    <td className="p-2.5">Digital In</td>
                    <td className="p-2.5">3.3V</td>
                    <td className="p-2.5 font-sans">Hidden driver emergency SOS panic button (Hardware debounced with 100nF cap).</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-blue-700">GPIO12</td>
                    <td className="p-2.5 font-bold">LED_RED_SEC</td>
                    <td className="p-2.5">Digital Out</td>
                    <td className="p-2.5">3.3V</td>
                    <td className="p-2.5 font-sans">Red Status LED: Armed security state, active alarm, or immobilization lock.</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-blue-700">GPIO13</td>
                    <td className="p-2.5 font-bold">LED_GRN_NET</td>
                    <td className="p-2.5">Digital Out</td>
                    <td className="p-2.5">3.3V</td>
                    <td className="p-2.5 font-sans">Green Status LED: Cellular LTE registered &amp; MQTT TLS broker connected.</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-blue-700">GPIO14</td>
                    <td className="p-2.5 font-bold">LED_BLU_GPS</td>
                    <td className="p-2.5">Digital Out</td>
                    <td className="p-2.5">3.3V</td>
                    <td className="p-2.5 font-sans">Blue Status LED: GNSS satellite 3D fix established (HDOP &lt; 2.0).</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-blue-700">GPIO15</td>
                    <td className="p-2.5 font-bold">BUZZER_PWM</td>
                    <td className="p-2.5">PWM Out</td>
                    <td className="p-2.5">3.3V</td>
                    <td className="p-2.5 font-sans">NPN transistor driver for 5V/12V piezo alarm siren and acoustic arming chirps.</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-blue-700">GPIO16</td>
                    <td className="p-2.5 font-bold">LTE_PWRKEY</td>
                    <td className="p-2.5">Digital Out</td>
                    <td className="p-2.5">3.3V</td>
                    <td className="p-2.5 font-sans">Quectel EC200U modem power-on sequence pulse pin (&gt;100ms pulse to boot modem).</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-blue-700">GPIO17</td>
                    <td className="p-2.5 font-bold">UART1_TXD</td>
                    <td className="p-2.5">UART Out</td>
                    <td className="p-2.5">3.3V</td>
                    <td className="p-2.5 font-sans">ESP32-S3 UART1 TX transmitting AT commands and PPP packets to EC200U RXD.</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-blue-700">GPIO18</td>
                    <td className="p-2.5 font-bold">UART1_RXD</td>
                    <td className="p-2.5">UART In</td>
                    <td className="p-2.5">3.3V</td>
                    <td className="p-2.5 font-sans">ESP32-S3 UART1 RX receiving AT responses, GNSS NMEA, and PPP packets from EC200U TXD.</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-blue-700">GPIO19</td>
                    <td className="p-2.5 font-bold">CAN_TX</td>
                    <td className="p-2.5">CAN Out</td>
                    <td className="p-2.5">3.3V</td>
                    <td className="p-2.5 font-sans">SN65HVD230 3.3V CAN transceiver transmit line connecting to vehicle OBD-II CAN-H/CAN-L.</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-blue-700">GPIO20</td>
                    <td className="p-2.5 font-bold">CAN_RX</td>
                    <td className="p-2.5">CAN In</td>
                    <td className="p-2.5">3.3V</td>
                    <td className="p-2.5 font-sans">SN65HVD230 3.3V CAN transceiver receive line (parses engine RPM, vehicle speed, DTC codes).</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-blue-700">GPIO21</td>
                    <td className="p-2.5 font-bold">I2C_SDA</td>
                    <td className="p-2.5">I2C Data</td>
                    <td className="p-2.5">3.3V</td>
                    <td className="p-2.5 font-sans">I2C Data line for LSM6DS3TR-C 6-axis IMU (with 4.7kΩ pull-up to 3.3V).</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-blue-700">GPIO22</td>
                    <td className="p-2.5 font-bold">I2C_SCL</td>
                    <td className="p-2.5">I2C Clock</td>
                    <td className="p-2.5">3.3V</td>
                    <td className="p-2.5 font-sans">I2C Clock line for LSM6DS3TR-C 6-axis IMU (with 4.7kΩ pull-up to 3.3V).</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* SECTION 4: FIRMWARE FREERTOS & CRASH DETECTION */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <Server className="w-5 h-5 text-blue-700" />
              <h2 className="text-lg font-bold text-slate-900">
                4. Firmware FreeRTOS Architecture &amp; Edge-AI State Machine
              </h2>
            </div>
            <p className="text-xs text-slate-700">
              The ESP32-S3 firmware is implemented in C++ using the official Espressif ESP-IDF (v5.1+) RTOS framework, maximizing power efficiency and real-time determinism:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                <h3 className="font-bold text-slate-900 mb-1 text-xs">Task 1: Sensor &amp; IMU (Core 1)</h3>
                <p className="text-[11px] text-slate-600">
                  Samples accelerometer and gyro registers at 100 Hz. Computes vector magnitude:
                  <br />
                  <code className="text-blue-700 font-bold">G_mag = sqrt(ax² + ay² + az²)</code>
                  <br />
                  If <code className="text-red-700 font-bold">G_mag &gt; 3.5g</code>, fires a CRASH interrupt and queues an instant emergency packet.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                <h3 className="font-bold text-slate-900 mb-1 text-xs">Task 2: GNSS &amp; Speed (Core 1)</h3>
                <p className="text-[11px] text-slate-600">
                  Parses NMEA sentences from Quectel GNSS stream. Computes geofence bounding-box checks locally on edge, speed in km/h, and updates device internal kinematic model.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                <h3 className="font-bold text-slate-900 mb-1 text-xs">Task 3: LTE &amp; MQTT (Core 0)</h3>
                <p className="text-[11px] text-slate-600">
                  Maintains mutual-TLS connection to EMQX broker. Publishes periodic 10s telemetry frames and listens on subscribed command topic:
                  <br />
                  <code className="text-blue-700">smrod/v1/devices/&#123;uid&#125;/cmd</code>.
                </p>
              </div>
            </div>

            {/* Immobilization safety code snippet */}
            <div className="p-3.5 bg-slate-950 text-slate-200 rounded-xl font-mono text-[11px] overflow-x-auto">
              <div className="text-slate-400 text-[10px] mb-1 font-sans font-semibold">
                // ESP32-S3 FreeRTOS Fail-Safe Immobilization Interlock Implementation:
              </div>
              <pre>{`void execute_remote_immobilize(const char* command_token) {
    // 1. Verify speed safety interlock (Must be under 5 km/h)
    if (g_vehicle_telemetry.speed_kmh > 5.0 && g_vehicle_telemetry.ignition_on) {
        ESP_LOGW(TAG, "Immobilization deferred: Vehicle moving at %.1f km/h", g_vehicle_telemetry.speed_kmh);
        mqtt_publish_ack("IMMOBILIZE_DEFERRED_SPEED_GATE", 409);
        return;
    }

    // 2. Drive Gate pin HIGH to energize relay and break fuel circuit
    gpio_set_level(GPIO_RELAY_KILL, 1);
    gpio_set_level(GPIO_LED_RED_SEC, 1);

    // 3. Sound audible deterrent buzzer chirps
    buzzer_beep(3, 200); 

    // 4. Publish signed execution acknowledgment to Supabase
    mqtt_publish_ack("IMMOBILIZE_SUCCESS_EXECUTED", 200);
}`}</pre>
            </div>
          </section>

          {/* SECTION 5: ROBOTIC VOICE ASSISTANT INTEGRATION */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <Activity className="w-5 h-5 text-blue-700" />
              <h2 className="text-lg font-bold text-slate-900">
                5. Robotic Car Voice &amp; Human-Machine Interface (HMI)
              </h2>
            </div>
            <p className="text-xs text-slate-700">
              The mobile driver app (Flutter) and Web Operations Center feature integrated robotic speech synthesis. Utilizing customized speech rates (0.46) and pitch (0.72), the interface delivers sci-fi military cyber-vehicle voice alerts during high-stress operational events:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-1">
                <span className="font-bold text-blue-900 text-xs">Immobilize Audio:</span>
                <p className="font-mono text-[11px] text-blue-800">
                  "Warning. Vehicle engine immobilized by command. Fuel supply severed. Vehicle secured."
                </p>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg space-y-1">
                <span className="font-bold text-emerald-900 text-xs">Mobilize Audio:</span>
                <p className="font-mono text-[11px] text-emerald-800">
                  "System authorized. Vehicle mobilized. Fuel line restored. All safety systems nominal."
                </p>
              </div>

              <div className="p-3 bg-red-50 border border-red-200 rounded-lg space-y-1">
                <span className="font-bold text-red-900 text-xs">Emergency Alert:</span>
                <p className="font-mono text-[11px] text-red-800">
                  "Critical alert. Security breach detected. Emergency lockdown initiated. Transmitting telemetry."
                </p>
              </div>
            </div>
          </section>

          {/* Document Sign-off / Print Footer */}
          <div className="border-t-2 border-slate-900 pt-6 mt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-600 gap-4">
            <div>
              <p className="font-bold text-slate-900">SMROD AIoT Automotive Engineering Directorate</p>
              <p className="text-[11px] text-slate-500">Document approved for hardware prototype fabrication &amp; PCB layout.</p>
            </div>
            <div className="text-right">
              <span className="font-mono font-semibold text-slate-800">STATUS: READY FOR MANUFACTURE</span>
              <p className="text-[11px] text-slate-500">&copy; {new Date().getFullYear()} SMROD Vehicle Security Systems Inc.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
