// src/models/Song.ts

export interface Song {
  id: number;
  title: string;
  artist: string;
  duration: string; // formato "m:ss"
  audioUrl?: string; // URL del archivo de audio real
  file?: File; // Instancia real para extraer ID3
}