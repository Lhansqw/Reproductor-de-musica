// src/services/VolumeController.ts

export type VolumeIcon = "mute" | "low" | "mid" | "high";

export class VolumeController {
  private _volume: number;   // 0 – 100
  private _muted: boolean = false;
  private _prevVolume: number;

  constructor(initialVolume: number = 70) {
    this._volume = Math.max(0, Math.min(100, initialVolume));
    this._prevVolume = this._volume;
  }

  // ── Getters ─────────────────────────────────────────────
  /** Volumen efectivo (0 si muted) */
  get volume(): number {
    return this._muted ? 0 : this._volume;
  }

  /** Valor crudo del slider (ignora mute) */
  get rawVolume(): number {
    return this._volume;
  }

  get isMuted(): boolean {
    return this._muted;
  }

  // ── Setters ─────────────────────────────────────────────
  volumeUp(step: number = 10): void {
    this._volume = Math.min(100, this._volume + step);
    if (this._muted) this._muted = false;
  }

  volumeDown(step: number = 10): void {
    this._volume = Math.max(0, this._volume - step);
  }

  setVolume(value: number): void {
    this._volume = Math.max(0, Math.min(100, Math.round(value)));
    if (this._muted && this._volume > 0) this._muted = false;
  }

  toggleMute(): void {
    if (this._muted) {
      this._muted = false;
      if (this._volume === 0) this._volume = this._prevVolume || 50;
    } else {
      this._prevVolume = this._volume;
      this._muted = true;
    }
  }

  // ── Utilidad UI ─────────────────────────────────────────
  getIcon(): VolumeIcon {
    if (this._muted || this._volume === 0) return "mute";
    if (this._volume < 33) return "low";
    if (this._volume < 66) return "mid";
    return "high";
  }
}