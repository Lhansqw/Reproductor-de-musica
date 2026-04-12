// src/visualizers/FrequencyVisualizer.ts
//
// Frequency spectrum visualizer for the right panel.
// Simulates higher energy in low frequencies, with peak indicators.

export class FrequencyVisualizer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private bars: number;
  private data: number[];
  private targets: number[];
  private _playing: boolean = false;
  private engine: import("../services/AudioEngine").AudioEngine | null = null;

  constructor(canvasId: string, bars: number = 40) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext("2d")!;
    this.bars = bars;
    this.data = new Array(bars).fill(0);
    this.targets = new Array(bars).fill(0);
    this.loop();
  }

  set playing(value: boolean) {
    this._playing = value;
  }

  setAudioEngine(engine: import("../services/AudioEngine").AudioEngine) {
    this.engine = engine;
  }

  private resize(): void {
    this.canvas.width = this.canvas.offsetWidth * devicePixelRatio;
    this.canvas.height = this.canvas.offsetHeight * devicePixelRatio;
  }

  private updateTargets(): void {
    if (!this._playing || !this.engine) {
      this.targets = this.targets.map(() => 0);
      return;
    }
    
    const freqData = this.engine.getFrequencyData();
    const step = Math.floor(freqData.length / this.bars) || 1;

    this.targets = this.targets.map((_, i) => {
      let sum = 0;
      for (let j = 0; j < step; j++) {
        const index = i * step + j;
        if (index < freqData.length) sum += freqData[index];
      }
      return (sum / step) / 255.0; // Normalize to 0-1
    });
  }

  private draw(): void {
    this.resize();
    this.updateTargets();

    // Exponential smoothing
    this.data = this.data.map((v, i) => v + (this.targets[i] - v) * 0.12);

    const { width: w, height: h } = this.canvas;
    this.ctx.clearRect(0, 0, w, h);

    // Subtle background when active
    if (this._playing) {
      const grd = this.ctx.createLinearGradient(0, 0, w, 0);
      grd.addColorStop(0, "rgba(167,139,250,0.03)");
      grd.addColorStop(0.5, "rgba(244,114,182,0.03)");
      grd.addColorStop(1, "rgba(167,139,250,0.03)");
      this.ctx.fillStyle = grd;
      this.ctx.fillRect(0, 0, w, h);
    }

    const bw = w / this.bars;

    this.data.forEach((v, i) => {
      const x = i * bw;
      const bh = Math.max(1, v * (h - 10));
      const y = h - bh;
      const hue = 260 + i * 1.8; // violet → pink

      this.ctx.fillStyle = `hsla(${hue},80%,75%,${0.3 + v * 0.7})`;
      this.ctx.fillRect(x + 1, y, bw - 2, bh);

      // Peak indicator
      if (v > 0.6) {
        this.ctx.fillStyle = `hsla(${hue},100%,90%,${v})`;
        this.ctx.fillRect(x + 1, y - 2, bw - 2, 2);
      }
    });

    // Baseline
    this.ctx.strokeStyle = "rgba(167,139,250,0.1)";
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(0, h - 1);
    this.ctx.lineTo(w, h - 1);
    this.ctx.stroke();
  }

  private loop(): void {
    this.draw();
    requestAnimationFrame(() => this.loop());
  }
}