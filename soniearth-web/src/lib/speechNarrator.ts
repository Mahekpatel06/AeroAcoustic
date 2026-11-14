/**
 * speechNarrator.ts
 * Autonomous Voice Guidance using Web Speech API with 90/10 Audio Ducking.
 */
import { audioEngine } from "./audioEngine";

class SpeechNarrator {
  private isEnabled = true;

  public toggle(): boolean {
    this.isEnabled = !this.isEnabled;
    if (!this.isEnabled && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      audioEngine.duckAudio(false);
    }
    return this.isEnabled;
  }

  public getStatus(): boolean {
    return this.isEnabled;
  }

  public speak(text: string) {
    if (!this.isEnabled) return;
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    // Cancel any previous speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    // 90/10 Ducking: Lower music volume when speaking begins
    utterance.onstart = () => {
      audioEngine.duckAudio(true);
    };

    // Restore music volume when speaking finishes or cancels
    utterance.onend = () => {
      audioEngine.duckAudio(false);
    };

    utterance.onerror = () => {
      audioEngine.duckAudio(false);
    };

    window.speechSynthesis.speak(utterance);
  }
}

export const speechNarrator = new SpeechNarrator();
