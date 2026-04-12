// src/models/Song.ts

export interface Song {
  id: number;
  title: string;
  artist: string;
  duration: string; // duration format "m:ss"
  audioUrl?: string; // Real audio file URL
  file?: File; // Real instance for extracting ID3
}