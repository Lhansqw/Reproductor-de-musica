// src/services/DeezerService.ts

export interface DeezerTrack {
  id: number;
  title: string;
  artist: {
    name: string;
  };
  duration: number;
  preview: string;
  album: {
    cover_medium: string;
    title: string;
  };
}

export class DeezerService {
  private readonly baseUrl = "/api/deezer";

  async search(query: string): Promise<DeezerTrack[]> {
    if (!query) return [];
    try {
      const response = await fetch(`${this.baseUrl}/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error("Deezer API error");
      const json = await response.json();
      return json.data || [];
    } catch (error) {
      console.error("Deezer Search Failed:", error);
      return [];
    }
  }

  formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }
}
