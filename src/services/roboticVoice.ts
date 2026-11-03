/**
 * SMROD AIOT Robotic Car Voice Synthesizer
 * Uses Web Speech API with frequency & formant modulation for deep robotic/cybernetic car voice.
 */

class RoboticVoiceService {
  private enabled: boolean = true;
  private voice: SpeechSynthesisVoice | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'localStorage' in window) {
      const saved = localStorage.getItem('smrod_robotic_voice');
      this.enabled = saved !== 'false';
    }
    this.initVoice();
  }

  private initVoice() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    
    const updateVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      // Prefer Google or English male/deep voices to get the best robotic resonance
      this.voice =
        voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Male') || v.name.includes('David'))) ||
        voices.find((v) => v.lang.startsWith('en')) ||
        voices[0] ||
        null;
    };

    updateVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
    if (typeof window !== 'undefined' && 'localStorage' in window) {
      localStorage.setItem('smrod_robotic_voice', val.toString());
    }
    if (val) {
      this.speak('Robotic vehicle security audio system online.');
    } else {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
  }

  public speak(text: string) {
    if (!this.enabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel(); // clear queue for immediate response
      const utterance = new SpeechSynthesisUtterance(text);
      if (this.voice) {
        utterance.voice = this.voice;
      }

      // Robotic voice modulation: lower pitch and measured tempo
      utterance.pitch = 0.68; // Deep resonant formant
      utterance.rate = 0.92;  // Deliberate robotic pace
      utterance.volume = 1.0;

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('[RoboticVoice] Synthesis failed:', e);
    }
  }

  public speakCommand(commandType: string, vehiclePlate?: string) {
    const plate = vehiclePlate ? `Vehicle ${vehiclePlate}. ` : '';
    switch (commandType) {
      case 'immobilize':
        this.speak(`Warning. ${plate}Fuel relay cutoff activated. Engine immobilized.`);
        break;
      case 'mobilize':
        this.speak(`${plate}Power relay restored. Engine ignition circuit normal.`);
        break;
      case 'trigger_alarm':
        this.speak(`Alert. ${plate}Emergency siren and hazard strobes engaged.`);
        break;
      case 'lock_doors':
        this.speak(`${plate}Central lock engaged. Vehicle cabin secured.`);
        break;
      case 'unlock_doors':
        this.speak(`${plate}Cabin doors unlocked.`);
        break;
      case 'diagnostics_ping':
        this.speak(`${plate}VSCU diagnostics ping dispatched. Edge telemetry operational.`);
        break;
      case 'reboot_device':
        this.speak(`${plate}ESP32 hardware reboot sequence initiated.`);
        break;
      default:
        this.speak(`${plate}Command ${commandType} dispatched.`);
    }
  }

  public speakEmergency(type: 'lockdown' | 'alarm' | 'sos') {
    switch (type) {
      case 'lockdown':
        this.speak('Fleet lockdown protocol active. All stationary vehicle engines latched.');
        break;
      case 'alarm':
        this.speak('Emergency all-units siren broadcasted to fleet gateways.');
        break;
      case 'sos':
        this.speak('Critical SOS signal received. Dispatch command center responding.');
        break;
    }
  }

  public testVoice() {
    this.speak('SMROD Edge Intelligence online. All systems nominal. Security perimeter secure.');
  }
}

export const roboticVoice = new RoboticVoiceService();
