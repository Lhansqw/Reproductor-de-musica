// src/visualizers/ParticleSystem.ts
//
// Floating particle system for the background.
// Particles accelerate and pulse when playing.

interface ParticleOptions {
  count?: number;
}

class Particle {
  x: number = 0;
  y: number = 0;
  size: number = 0;
  speedX: number = 0;
  speedY: number = 0;
  life: number = 1;
  decay: number = 0;
  color: string = "";
  pulse: number = 0;
  pulseSpeed: number = 0;

  constructor(
    private canvasW: number,
    private canvasH: number,
    init: boolean = false
  ) {
    this.reset(init);
  }

  reset(init: boolean = false): void {
    this.x = Math.random() * this.canvasW;
    this.y = init
      ? Math.random() * this.canvasH
      : this.canvasH + 10;
    this.size = Math.random() * 2.5 + 0.5;
    this.speedX = (Math.random() - 0.5) * 0.4;
    this.speedY = -(Math.random() * 0.6 + 0.2);
    this.life = 1;
    this.decay = Math.random() * 0.004 + 0.002;
    const hue =
      Math.random() < 0.6
        ? 270 + Math.random() * 30
        : 320 + Math.random() * 20;
    this.color = `hsla(${hue},80%,75%,`;
    this.pulse = Math.random() * Math.PI * 2;
    this.pulseSpeed = Math.random() * 0.04 + 0.02;
  }

  update(playing: boolean, bassEnergy: number): void {
    this.pulse += this.pulseSpeed + bassEnergy * 0.1;
    // bassEnergy goes from 0 to 1. Amplify speed if there is bass.
    const energyBoost = playing ? (1 + bassEnergy * 4) : 0.5;
    const speed = playing ? (1.8 * energyBoost) : 0.6;
    this.x += this.speedX * (playing ? (1.5 + bassEnergy) : 0.5);
    this.y += this.speedY * speed;
    this.life -= this.decay * (playing ? 1.5 : 0.5);
    if (this.life <= 0 || this.y < -10) this.reset();
  }

  draw(ctx: CanvasRenderingContext2D, playing: boolean, bassEnergy: number): void {
    // Increase size if there is bass
    const s =
      this.size * (1 + Math.sin(this.pulse) * 0.3 * (playing ? 1 : 0.2)) + bassEnergy * 2;
    ctx.beginPath();
    ctx.arc(this.x, this.y, s, 0, Math.PI * 2);
    // Change opacity based on energy
    const alpha = Math.min(1, this.life * 0.6 + bassEnergy * 0.4);
    ctx.fillStyle = this.color + alpha + ")";
    ctx.fill();
  }
}

export class ParticleSystem {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private particles: Particle[];
  private _playing: boolean = false;
  private engine: import("../services/AudioEngine").AudioEngine | null = null;

  constructor(canvasId: string, options: ParticleOptions = {}) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext("2d")!;
    this.resize();
    window.addEventListener("resize", () => this.resize());

    const count = options.count ?? 80;
    this.particles = Array.from(
      { length: count },
      () => new Particle(this.canvas.width, this.canvas.height, true)
    );
    this.loop();
  }

  set playing(value: boolean) {
    this._playing = value;
  }

  setAudioEngine(engine: import("../services/AudioEngine").AudioEngine) {
    this.engine = engine;
  }

  private resize(): void {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  private draw(): void {
    const bassEnergy = this.engine && this._playing ? this.engine.getBassEnergy() : 0;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.particles.forEach((p) => {
      p.update(this._playing, bassEnergy);
      p.draw(this.ctx, this._playing, bassEnergy);
    });
  }

  private loop(): void {
    this.draw();
    requestAnimationFrame(() => this.loop());
  }
}