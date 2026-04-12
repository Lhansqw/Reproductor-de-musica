// src/main.ts

import { PlaylistService } from "./services/PlaylistService";
import { VolumeController } from "./services/VolumeController";
import { BarVisualizer } from "./visualizers/BarVisualizer";
import { FrequencyVisualizer } from "./visualizers/FrequencyVisualizer";
import { ParticleSystem } from "./visualizers/ParticleSystem";
import { AudioEngine } from "./services/AudioEngine";
// @ts-ignore: Missing types for the minified dist import
import jsmediatags from "jsmediatags/dist/jsmediatags.min.js";

let searchFilter = "";

// ── Service instances ────────────────────────────────────────
const playlist = new PlaylistService();
const vol = new VolumeController(70);

// ── Visualizers ──────────────────────────────────────────────
const barViz = new BarVisualizer("viz-canvas", 28);
const freqViz = new FrequencyVisualizer("freq-canvas", 40);
const particles = new ParticleSystem("bg-canvas", { count: 80 });

const engine = new AudioEngine();
barViz.setAudioEngine(engine);
freqViz.setAudioEngine(engine);
particles.setAudioEngine(engine);

// ── Player state ─────────────────────────────────────────────
let isPlaying = false;
let progressSec = 0;
let timerId: ReturnType<typeof setInterval> | null = null;
const MAX_SEC = 210;

// ── Demo songs ───────────────────────────────────────────────
const DEMO_URL_1 = "/demo1.mp3";
const DEMO_URL_2 = "/demo2.mp3";
const DEMO_URL_3 = "/demo3.mp3";
const DEMO_URL_4 = "/The Weeknd - Blinding Lights (Official Audio).mp3";

playlist.addLast("Blinding Lights (Local)", "The Weeknd", "3:23", DEMO_URL_4);
playlist.addLast("Levitating (Demo 2)", "Dua Lipa", "7:05", DEMO_URL_2);
playlist.addLast("Stay (Demo 3)", "The Kid LAROI", "5:44", DEMO_URL_3);
playlist.addLast("Bad Guy", "Billie Eilish", "3:14");
playlist.addLast("As It Was", "Harry Styles", "2:37");
playlist.addLast("Heat Waves", "Glass Animals", "3:59");
playlist.addLast("Flowers", "Miley Cyrus", "3:21");
playlist.addLast("Unholy", "Sam Smith", "2:36");

// ── Timer / Progress ─────────────────────────────────────────
engine.onTimeUpdate = (currentTime, duration) => {
  progressSec = currentTime;
  const fill = document.getElementById("progress-fill") as HTMLElement;
  const timeEl = document.getElementById("time-current") as HTMLElement;
  
  // Assuming `duration` is Infinity if not loaded, use local percentage
  const safeDur = duration || MAX_SEC;
  const pct = Math.min((currentTime / safeDur) * 100, 100);
  fill.style.width = pct + "%";
  
  const m = Math.floor(currentTime / 60);
  const s = Math.floor(currentTime % 60);
  timeEl.textContent = `${m}:${s.toString().padStart(2, "0")}`;
  
  // Also update total duration if possible
  if (duration && duration !== Infinity) {
    const dm = Math.floor(duration / 60);
    const ds = Math.floor(duration % 60);
    const timeTotalEl = document.getElementById("time-total"); // We will need to assign an ID if we want to update it
    if (timeTotalEl) timeTotalEl.textContent = `${dm}:${ds.toString().padStart(2, "0")}`;
  }
};

engine.onEnded = () => {
  (window as any).nextSong();
};

function startTimer(): void {
  // Now progress is handled by onTimeUpdate when isPlaying = true
}

function stopTimer(): void {
  // Handled internally
}

function updateProgressUI(): void {
  // If not playing a real song, reset UI (or force manually) or when song changes
  const fill = document.getElementById("progress-fill") as HTMLElement;
  const timeEl = document.getElementById("time-current") as HTMLElement;
  if(progressSec === 0) {
    fill.style.width = "0%";
    timeEl.textContent = "0:00";
  }
}

// ── Synchronize visual effects state ─────────────────────────
function syncVisualEffects(): void {
  barViz.playing = isPlaying;
  freqViz.playing = isPlaying;
  particles.playing = isPlaying;
  if (isPlaying) document.body.classList.add("is-playing");
  else document.body.classList.remove("is-playing");
}

// ── Playback controls ────────────────────────────────────────
(window as any).togglePlay = (): void => {
  isPlaying = !isPlaying;
  const vinyl = document.getElementById("vinyl") as HTMLElement;
  const iconPlay = document.getElementById("icon-play") as HTMLElement;
  const iconPause = document.getElementById("icon-pause") as HTMLElement;

  iconPlay.style.display = isPlaying ? "none" : "block";
  iconPause.style.display = isPlaying ? "block" : "none";

  if (isPlaying) {
    vinyl.classList.add("spinning");
    const cur = playlist.getCurrent();
    if (!engine.isPlaying && cur?.audioUrl && !engine.getDuration()) { 
       engine.setSrc(cur.audioUrl);
    }
    if (cur?.file) extractTheme(cur.file);
    else document.documentElement.style.setProperty("--accent", "#a78bfa");
    engine.play();
  } else {
    vinyl.classList.remove("spinning");
    engine.pause();
  }

  syncVisualEffects();
  renderAll();
};

(window as any).nextSong = (): void => {
  engine.pause();
  playlist.next();
  progressSec = 0;
  updateProgressUI();
  const cur = playlist.getCurrent();
  if (cur?.audioUrl) engine.setSrc(cur.audioUrl);
  else engine.setSrc("");
  if (cur?.file) extractTheme(cur.file);
  else document.documentElement.style.setProperty("--accent", "#a78bfa");
  if (isPlaying) engine.play();
  renderAll();
};

(window as any).prevSong = (): void => {
  engine.pause();
  playlist.prev();
  progressSec = 0;
  updateProgressUI();
  const cur = playlist.getCurrent();
  if (cur?.audioUrl) engine.setSrc(cur.audioUrl);
  else engine.setSrc("");
  if (cur?.file) extractTheme(cur.file);
  else document.documentElement.style.setProperty("--accent", "#a78bfa");
  if (isPlaying) engine.play();
  renderAll();
};

(window as any).selectSong = (id: number): void => {
  engine.pause();
  playlist.selectById(id);
  progressSec = 0;
  updateProgressUI();
  const cur = playlist.getCurrent();
  if (cur?.audioUrl) engine.setSrc(cur.audioUrl);
  else engine.setSrc("");
  if (cur?.file) extractTheme(cur.file);
  else document.documentElement.style.setProperty("--accent", "#a78bfa");
  if (isPlaying) engine.play();
  renderAll();
};

(window as any).removeSong = (id: number, e: MouseEvent): void => {
  e.stopPropagation();
  playlist.remove(id);
  renderAll();
};

(window as any).seekSong = (e: MouseEvent): void => {
  const track = document.getElementById("progress-track") as HTMLElement;
  if (!track) return;
  const rect = track.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const pct = Math.max(0, Math.min(1, clickX / rect.width));
  
  const total = engine.getDuration();
  if (total && total !== Infinity) {
    engine.seek(pct * total);
    // Update visually instantly
    const fill = document.getElementById("progress-fill") as HTMLElement;
    fill.style.width = (pct * 100) + "%";
  }
};

// ── Seek within current song (seconds) ───────────────────────
(window as any).seekForward = (seconds: number = 10): void => {
  const current = engine.getCurrentTime();
  const duration = engine.getDuration();
  if (duration && duration !== Infinity) {
    engine.seek(Math.min(current + seconds, duration));
  }
};

(window as any).seekBackward = (seconds: number = 10): void => {
  const current = engine.getCurrentTime();
  engine.seek(Math.max(current - seconds, 0));
};

// ── Volume controls ──────────────────────────────────────────
(window as any).volumeUp = (): void => { vol.volumeUp(10); renderVol(); };
(window as any).volumeDown = (): void => { vol.volumeDown(10); renderVol(); };
(window as any).setVolume = (v: string): void => { vol.setVolume(parseInt(v)); renderVol(); };
(window as any).toggleMute = (): void => { vol.toggleMute(); renderVol(); };

// Hook the engine to the global volume (intercepting renderVol response or direct)
const autoSetVolume = () => { 
   engine.setVolume(vol.isMuted ? 0 : vol.rawVolume); 
};

// ── Modal ────────────────────────────────────────────────────
(window as any).openModal = (): void =>
  (document.getElementById("modal-bg") as HTMLElement).classList.add("open");

(window as any).closeModal = (): void => {
  (document.getElementById("modal-bg") as HTMLElement).classList.remove("open");
  clearForm();
};

(window as any).togglePosInput = (): void => {
  const val = (document.getElementById("f-position") as HTMLSelectElement).value;
  (document.getElementById("position-wrap") as HTMLElement).style.display =
    val === "at" ? "flex" : "none";
};

(window as any).addSong = (): void => {
  const title = (document.getElementById("f-title") as HTMLInputElement).value.trim();
  const artist = (document.getElementById("f-artist") as HTMLInputElement).value.trim();
  const dur = (document.getElementById("f-duration") as HTMLInputElement).value.trim() || "3:00";
  if (!title || !artist) { alert("Ingresa título y artista (El autocompletador puede llenarlos por ti al seleccionar un archivo)."); return; }
  
  let fileUrl: string | undefined;
  const fileInput = document.getElementById("f-file") as HTMLInputElement;
  if (fileInput && fileInput.files && fileInput.files.length > 0) {
    fileUrl = URL.createObjectURL(fileInput.files[0]);
  }

  const pos = (document.getElementById("f-position") as HTMLSelectElement).value;
  if (pos === "start") playlist.addFirst(title, artist, dur, fileUrl);
  else if (pos === "end") playlist.addLast(title, artist, dur, fileUrl);
  else {
    const n = parseInt((document.getElementById("f-pos-val") as HTMLInputElement).value) || 0;
    playlist.addAt(title, artist, dur, n, fileUrl);
  }
  (window as any).closeModal();
  renderAll();
};

(window as any).autoFillTitle = (input: HTMLInputElement): void => {
  if (input.files && input.files.length > 0) {
    const file = input.files[0];
    let name = file.name;
    const lastDot = name.lastIndexOf(".");
    if (lastDot > 0) name = name.substring(0, lastDot);
    
    const titleInput = document.getElementById("f-title") as HTMLInputElement;
    const artistInput = document.getElementById("f-artist") as HTMLInputElement;
    
    // Auto-detect "Artist - Title" format
    if (name.includes("-")) {
       const parts = name.split("-");
       if (!artistInput.value) artistInput.value = parts[0].trim();
       if (!titleInput.value) titleInput.value = parts.slice(1).join("-").trim();
    } else {
       if (!titleInput.value) titleInput.value = name;
    }
  }
};

function clearForm(): void {
  ["f-title", "f-artist", "f-duration"].forEach(
    (id) => ((document.getElementById(id) as HTMLInputElement).value = "")
  );
  const fileInput = document.getElementById("f-file") as HTMLInputElement;
  if (fileInput) fileInput.value = "";
  
  (document.getElementById("f-pos-val") as HTMLInputElement).value = "0";
  (document.getElementById("f-position") as HTMLSelectElement).value = "end";
  (document.getElementById("position-wrap") as HTMLElement).style.display = "none";
}

// ── Search & Filters ─────────────────────────────────────────
(window as any).onSearchInput = (e: Event): void => {
  searchFilter = (e.target as HTMLInputElement).value.toLowerCase();
  renderPlaylist();
};

(window as any).toggleShuffle = (): void => {
  playlist.toggleShuffle();
  const btn = document.getElementById("btn-shuffle");
  if (playlist.isShuffled) btn?.classList.add("active");
  else btn?.classList.remove("active");
  renderAll();
};

(window as any).toggleLoop = (): void => {
  playlist.toggleLoop();
  const btn = document.getElementById("btn-loop");
  if (playlist.isLooping) btn?.classList.add("active");
  else btn?.classList.remove("active");
};

// ── Color Extraction (Album Art) ─────────────────────────────
function extractTheme(file: File) {
  document.documentElement.style.setProperty("--accent", "#a78bfa"); // default
  jsmediatags.read(file, {
    onSuccess: function(tag: any) {
      const picture = tag.tags.picture;
      if (picture) {
        let base64String = "";
        for (let i = 0; i < picture.data.length; i++) {
            base64String += String.fromCharCode(picture.data[i]);
        }
        const base64 = "data:" + picture.format + ";base64," + window.btoa(base64String);
        
        const img = new Image();
        img.onload = () => {
           const canvas = document.createElement("canvas");
           canvas.width = 1; canvas.height = 1;
           const ctx = canvas.getContext("2d");
           if (ctx) {
             ctx.drawImage(img, 0, 0, 1, 1);
             const p = ctx.getImageData(0, 0, 1, 1).data;
             const hex = "#" + ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);
             document.documentElement.style.setProperty("--accent", hex);
           }
        };
        img.src = base64;
      }
    },
    onError: function(error: any) {
      console.warn("jsmediatags parsing fallback", error);
    }
  });
}

function rgbToHex(r: number, g: number, b: number) {
    if (r > 255 || g > 255 || b > 255) throw "Invalid color component";
    return ((r << 16) | (g << 8) | b).toString(16);
}

// ── Keyboard Shortcuts and Drag & Drop ───────────────────────
window.addEventListener("keydown", (e) => {
  if (e.target instanceof HTMLInputElement) return; // Don't interfere with inputs
  if (e.code === "Space") { e.preventDefault(); (window as any).togglePlay(); }
  // Shift + Arrow → seek ±10s within current song
  if (e.code === "ArrowRight" && e.shiftKey) { e.preventDefault(); (window as any).seekForward(10); }
  else if (e.code === "ArrowLeft" && e.shiftKey) { e.preventDefault(); (window as any).seekBackward(10); }
  // Plain Arrow → change song
  else if (e.code === "ArrowRight") { e.preventDefault(); (window as any).nextSong(); }
  else if (e.code === "ArrowLeft")  { e.preventDefault(); (window as any).prevSong(); }
  if (e.code === "ArrowUp")   { e.preventDefault(); (window as any).volumeUp(); }
  if (e.code === "ArrowDown") { e.preventDefault(); (window as any).volumeDown(); }
});

document.body.addEventListener("dragover", (e) => { e.preventDefault(); document.body.style.opacity = "0.7"; });
document.body.addEventListener("dragleave", () => { document.body.style.opacity = "1"; });
document.body.addEventListener("drop", (e) => {
  e.preventDefault();
  document.body.style.opacity = "1";
  if (e.dataTransfer && e.dataTransfer.files) {
    for (let i = 0; i < e.dataTransfer.files.length; i++) {
        const file = e.dataTransfer.files[i];
        if (!file.type.startsWith("audio/")) continue;
        const fileUrl = URL.createObjectURL(file);
        let name = file.name;
        const lastDot = name.lastIndexOf(".");
        if (lastDot > 0) name = name.substring(0, lastDot);
        let title = name; let artist = "Desconocido";
        if (name.includes("-")) {
           const parts = name.split("-");
           artist = parts[0].trim(); title = parts.slice(1).join("-").trim();
        }
        playlist.addLast(title, artist, "3:00", fileUrl, file);
    }
    renderAll();
  }
});

// ── Volume icons ─────────────────────────────────────────────
const VOL_ICONS: Record<string, string> = {
  mute: `<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z"/></svg>`,
  low:  `<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M7 9v6h4l5 5V4l-5 5H7z"/></svg>`,
  mid:  `<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/></svg>`,
  high: `<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`,
};

// ── Renders ──────────────────────────────────────────────────
function renderVol(): void {
  const slider = document.getElementById("vol-slider") as HTMLInputElement;
  document.getElementById("vol-label")!.textContent =
    vol.isMuted ? "0" : String(vol.rawVolume);
  document.getElementById("vol-icon")!.innerHTML = VOL_ICONS[vol.getIcon()];
  slider.value = String(vol.rawVolume);
  slider.style.setProperty("--val", vol.rawVolume + "%");
  
  // Update audio engine
  engine.setVolume(vol.isMuted ? 0 : vol.rawVolume);
}

function renderPlaylist(): void {
  const songs = playlist.getAll().filter(s => 
    !searchFilter || 
    s.title.toLowerCase().includes(searchFilter) || 
    s.artist.toLowerCase().includes(searchFilter)
  );
  const cur = playlist.getCurrent();

  (document.getElementById("np-title") as HTMLElement).textContent =
    cur?.title ?? "Sin canción";
  (document.getElementById("np-artist") as HTMLElement).textContent =
    cur?.artist ?? "—";

  const list = document.getElementById("song-list") as HTMLElement;
  if (!songs.length) {
    list.innerHTML = `<div class="empty"><span class="empty-icon">🎵</span><p>Tu playlist está vacía</p></div>`;
    return;
  }

  list.innerHTML = songs
    .map((s, i) => {
      const active = cur?.id === s.id;
      const playing = active && isPlaying;
      return `
      <div class="song-item ${active ? "active" : ""} ${playing ? "playing" : ""}"
           onclick="selectSong(${s.id})">
        <div class="song-num">
          <span class="song-num-text">${active ? "♪" : i + 1}</span>
          <div class="song-bar-icon">
            <div class="bar"></div><div class="bar"></div><div class="bar"></div>
          </div>
        </div>
        <div class="song-info">
          <div class="song-title-text">${s.title}</div>
          <div class="song-artist-text">${s.artist}</div>
        </div>
        <div class="song-dur">${s.duration}</div>
        <button class="btn-del" onclick="removeSong(${s.id}, event)">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>`;
    })
    .join("");
}

function renderUpNext(): void {
  const upNext = playlist.getUpNext();
  const el = document.getElementById("up-next-list") as HTMLElement;

  el.innerHTML = upNext.length === 0
    ? `<p class="un-empty">No hay más canciones en cola</p>`
    : upNext.slice(0, 6).map((s, i) => `
      <div class="un-item" onclick="selectSong(${s.id})">
        <span class="un-num">${i + 1}</span>
        <div class="un-info">
          <div class="un-title-text">${s.title}</div>
          <div class="un-artist">${s.artist}</div>
        </div>
        <span class="un-dur">${s.duration}</span>
      </div>`).join("");
}

function renderAll(): void {
  renderPlaylist();
  renderUpNext();
  renderVol();
}

// ── Init ─────────────────────────────────────────────────────
renderAll();