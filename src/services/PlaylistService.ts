// src/services/PlaylistService.ts

import { Song } from "../models/Song";

export class PlaylistService {
  private songs: Song[] = [];
  private currentIndex: number = -1;
  private idCounter: number = 1;
  public isLooping: boolean = true;
  public isShuffled: boolean = false;

  constructor() {
    // Empty
  }

  // ── Private helpers ─────────────────────────────────────
  private generateId(): number {
    return this.idCounter++;
  }

  private makeSong(title: string, artist: string, duration: string, audioUrl?: string, file?: File, albumArt?: string): Song {
    return { id: this.generateId(), title, artist, duration, audioUrl, file, albumArt };
  }

  // ── Add songs ───────────────────────────────────────────
  addFirst(title: string, artist: string, duration: string, audioUrl?: string, file?: File, albumArt?: string): Song {
    const song = this.makeSong(title, artist, duration, audioUrl, file, albumArt);
    this.songs.unshift(song);
    
    // Update index if we added something before current
    if (this.currentIndex >= 0) {
      this.currentIndex++;
    } else {
      this.currentIndex = 0;
    }
    return song;
  }

  addLast(title: string, artist: string, duration: string, audioUrl?: string, file?: File, albumArt?: string): Song {
    const song = this.makeSong(title, artist, duration, audioUrl, file, albumArt);
    this.songs.push(song);
    if (this.currentIndex === -1) this.currentIndex = 0;
    return song;
  }

  addAt(title: string, artist: string, duration: string, position: number, audioUrl?: string, file?: File, albumArt?: string): Song {
    const song = this.makeSong(title, artist, duration, audioUrl, file, albumArt);
    const pos = Math.max(0, Math.min(position, this.songs.length));
    
    this.songs.splice(pos, 0, song);
    
    // Update index if inserted before or at current
    if (this.currentIndex >= pos) {
      this.currentIndex++;
    } else if (this.currentIndex === -1) {
      this.currentIndex = 0;
    }
    return song;
  }

  // ── Remove song ─────────────────────────────────────────
  remove(id: number): boolean {
    const index = this.songs.findIndex(s => s.id === id);
    if (index === -1) return false;

    this.songs.splice(index, 1);

    // Adjust currentIndex
    if (this.songs.length === 0) {
      this.currentIndex = -1;
    } else if (this.currentIndex === index) {
      // Current was removed, stay at same index (next song) or wrap
      if (this.currentIndex >= this.songs.length) {
        this.currentIndex = 0;
      }
    } else if (this.currentIndex > index) {
      this.currentIndex--;
    }

    return true;
  }

  // ── Navigation ──────────────────────────────────────────
  next(): boolean {
    if (this.songs.length === 0) return false;

    if (this.currentIndex < this.songs.length - 1) {
      this.currentIndex++;
      return true;
    }
    
    if (this.isLooping) {
      this.currentIndex = 0;
      return true;
    }
    
    return false;
  }

  prev(): boolean {
    if (this.songs.length === 0) return false;

    if (this.currentIndex > 0) {
      this.currentIndex--;
      return true;
    }
    
    if (this.isLooping) {
      this.currentIndex = this.songs.length - 1;
      return true;
    }
    
    return false;
  }

  toggleLoop(): void {
    this.isLooping = !this.isLooping;
  }

  toggleShuffle(): void {
    this.isShuffled = !this.isShuffled;
    if (this.isShuffled && this.songs.length > 1) {
      const currentId = this.getCurrent()?.id;
      
      // Fisher-Yates shuffle
      for (let i = this.songs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.songs[i], this.songs[j]] = [this.songs[j], this.songs[i]];
      }

      if (currentId !== undefined) {
        this.selectById(currentId);
      }
    }
  }

  selectById(id: number): boolean {
    const index = this.songs.findIndex(s => s.id === id);
    if (index !== -1) {
      this.currentIndex = index;
      return true;
    }
    return false;
  }

  // ── Getters ─────────────────────────────────────────────
  getCurrent(): Song | null {
    if (this.currentIndex < 0 || this.currentIndex >= this.songs.length) return null;
    return this.songs[this.currentIndex];
  }

  getAll(): Song[] {
    return [...this.songs];
  }

  /** Songs coming AFTER the current one (queue / up-next) */
  getUpNext(): Song[] {
    if (this.currentIndex === -1 || this.songs.length === 0) return [];
    
    let upcoming: Song[] = [];

    if (this.isLooping) {
      // If looping, we take what's after current + what's at the start
      const after = this.songs.slice(this.currentIndex + 1);
      const before = this.songs.slice(0, this.currentIndex);
      upcoming = [...after, ...before];
    } else {
      upcoming = this.songs.slice(this.currentIndex + 1);
    }

    return upcoming.slice(0, 10);
  }

  get size(): number {
    return this.songs.length;
  }

  getPrevTitle(): string {
    if (this.currentIndex <= 0) {
      if (this.isLooping && this.songs.length > 0) {
        return this.songs[this.songs.length - 1].title;
      }
      return "null";
    }
    return this.songs[this.currentIndex - 1].title;
  }

  getNextTitle(): string {
    if (this.currentIndex === -1 || this.currentIndex >= this.songs.length - 1) {
      if (this.isLooping && this.songs.length > 0) {
        return this.songs[0].title;
      }
      return "null";
    }
    return this.songs[this.currentIndex + 1].title;
  }
}