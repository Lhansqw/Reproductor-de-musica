// src/visualizers/BarVisualizer.ts
//
// Bar visualizer for the sidebar.
// Simulates audio data with smoothed noise and animates using requestAnimationFrame.

export class BarVisualizer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private bars: number;
  private data: number[];
  private targets: number[];
  private _playing: boolean = false;
  private engine: import("../services/AudioEngine").AudioEngine | null = null;

  constructor(canvasId: string, bars: number = 28) {
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
    // We have 128 bins, we want to map them to our `this.bars` (e.g., 28)
    const step = Math.floor(freqData.length / this.bars) || 1;

    this.targets = this.targets.map((_, i) => {
      // Take an average of frequencies for each bar
      let sum = 0;
      for (let j = 0; j < step; j++) {
        const index = i * step + j;
        if (index < freqData.length) sum += freqData[index];
      }
      const avg = sum / step;
      return avg / 255.0; // Normalize between 0 and 1
    });
  }

  private draw(): void {
    this.resize();
    this.updateTargets();

    // Exponential smoothing
    this.data = this.data.map((v, i) => v + (this.targets[i] - v) * 0.15);

    const { width: w, height: h } = this.canvas;
    this.ctx.clearRect(0, 0, w, h);

    const bw = (w / this.bars) * 0.6;
    const gap = (w / this.bars) * 0.4;

    this.data.forEach((v, i) => {
      const x = i * (bw + gap) + gap / 2;
      const bh = v * h * 0.85;
      const y = h - bh;
      const t = i / this.bars;

      // Violet → pink gradient
      const r = Math.round(167 + (244 - 167) * t);
      const g = Math.round(139 + (114 - 139) * t);
      const b = Math.round(250 + (182 - 250) * t);
      this.ctx.fillStyle = `rgba(${r},${g},${b},${0.5 + v * 0.5})`;

      const radius = Math.min(2, bw / 2);
      this.ctx.beginPath();
      this.ctx.roundRect(x, y, bw, bh, radius);
      this.ctx.fill();

      // Glow at the top of the bar
      if (v > 0.3) {
        this.ctx.fillStyle = `rgba(255,255,255,${v * 0.3})`;
        this.ctx.fillRect(x, y, bw, 2);
      }
    });
  }

  private loop(): void {
    this.draw();
    requestAnimationFrame(() => this.loop());
  }
}