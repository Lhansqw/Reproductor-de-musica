// src/services/AudioEngine.ts

export class AudioEngine {
  private audio: HTMLAudioElement;
  private context: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaElementAudioSourceNode | null = null;
  private dataArray: Uint8Array = new Uint8Array(0);

  // Eventos para UI
  public onTimeUpdate?: (currentTime: number, duration: number) => void;
  public onEnded?: () => void;

  constructor() {
    this.audio = new Audio();
    this.audio.crossOrigin = "anonymous"; // Permite analizar fuentes externas si tienen CORS

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

  // Inicialización perezosa (requiere interacción del usuario)
  private initContext() {
    if (!this.context) {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.analyser = this.context.createAnalyser();
      this.analyser.fftSize = 256; // 128 bins de frecuencia
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

      this.source = this.context.createMediaElementSource(this.audio);
      this.source.connect(this.analyser);
      this.analyser.connect(this.context.destination);
    }
    
    // Si el contexto web audio estaba suspendido, reiniciarlo
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
      console.warn("Falló la reproducción automática. Esperando interacción.", e);
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
      this.analyser.getByteFrequencyData(this.dataArray);
    } else if (this.dataArray.length > 0) {
      // Si está en pausa, rellenar de ceros gradualmente para un desvanecimiento suave (opcional)
      // O simplemente mantener el dataArray en su último valor. 
      // Por limpieza, retornamos un arreglo de 0s si no está reproduciendo
      this.dataArray.fill(0);
    }
    return this.dataArray;
  }

  public getBassEnergy(): number {
    if (!this.analyser || !this.isPlaying) return 0;
    this.analyser.getByteFrequencyData(this.dataArray);
    // Tomar los primeros bins (bajos) para calcular la energía
    let sum = 0;
    const bassBins = 4; // Los primeros bins suelen representar los bajos (<200Hz aprox)
    for (let i = 0; i < bassBins; i++) {
        sum += this.dataArray[i];
    }
    return (sum / bassBins) / 255;
  }
}
