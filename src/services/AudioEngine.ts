// src/services/AudioEngine.ts

export class AudioEngine {
  private audio: HTMLAudioElement;
  private context: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaElementAudioSourceNode | null = null;
  private dataArray: Uint8Array = new Uint8Array(0);

  // UI Events
  public onTimeUpdate?: (currentTime: number, duration: number) => void;
  public onEnded?: () => void;

  constructor() {
    this.audio = new Audio();
    this.audio.crossOrigin = "anonymous"; // Allows analyzing external sources if they have CORS

    this.audio.addEventListener("timeupdate", () => {
      if (this.onTimeUpdate) {
        this.onTimeUpdate(this.audio.currentTime, this.audio.duration || 0);
      }
    });

    this.audio.addEventListener("ended", () => {
      if (this.onEnded) {
        this.onEnded();
      }
    });
  }

  // Lazy initialization (requires user interaction)
  private initContext() {
    if (!this.context) {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.analyser = this.context.createAnalyser();
      this.analyser.fftSize = 256; // 128 frequency bins
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

      this.source = this.context.createMediaElementSource(this.audio);
      this.source.connect(this.analyser);
      this.analyser.connect(this.context.destination);
    }
    
    // If the web audio context was suspended, resume it
    if (this.context.state === "suspended") {
      this.context.resume();
    }
  }

  public setSrc(url: string) {
    this.audio.src = url;
    this.audio.load();
  }

  public async play() {
    this.initContext();
    try {
      await this.audio.play();
    } catch (e) {
      console.warn("Autoplay failed. Waiting for interaction.", e);
    }
  }

  public pause() {
    this.audio.pause();
  }

  public setVolume(vol: number) {
    this.audio.volume = vol / 100;
  }

  public get isPlaying(): boolean {
    return !this.audio.paused;
  }

  public getCurrentTime(): number {
    return this.audio.currentTime;
  }
  
  public getDuration(): number {
    return this.audio.duration || 0;
  }
  
  public seek(time: number) {
    this.audio.currentTime = time;
  }

  public getFrequencyData(): Uint8Array {
    if (this.analyser && this.isPlaying) {
      this.analyser.getByteFrequencyData(this.dataArray as any);
    } else if (this.dataArray.length > 0) {
      // If paused, gradually fill with zeros for a smooth fade (optional)
      // Or simply keep dataArray at its last value. 
      // For cleanliness, we return an array of 0s if not playing
      this.dataArray.fill(0);
    }
    return this.dataArray;
  }

  public getBassEnergy(): number {
    if (!this.analyser || !this.isPlaying) return 0;
    this.analyser.getByteFrequencyData(this.dataArray as any);
    // Take the first bins (bass) to calculate energy
    let sum = 0;
    const bassBins = 4; // The first bins usually represent bass (<200Hz approx)
    for (let i = 0; i < bassBins; i++) {
        sum += this.dataArray[i];
    }
    return (sum / bassBins) / 255;
  }
}
