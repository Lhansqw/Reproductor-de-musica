// src/services/PlaylistService.ts

import { DoublyLinkedList, Node } from "../data-structures/DoublyLinkedList";
import { Song } from "../models/Song";

export class PlaylistService {
  private dll: DoublyLinkedList;
  private currentNode: Node | null = null;
  private idCounter: number = 1;
  public isLooping: boolean = true;
  public isShuffled: boolean = false;

  constructor() {
    this.dll = new DoublyLinkedList();
  }

  // ── Private helpers ─────────────────────────────────────
  private generateId(): number {
    return this.idCounter++;
  }

  private makeSong(title: string, artist: string, duration: string, audioUrl?: string, file?: File): Song {
    return { id: this.generateId(), title, artist, duration, audioUrl, file };
  }

  // ── Add songs ───────────────────────────────────────────
  addFirst(title: string, artist: string, duration: string, audioUrl?: string, file?: File): Song {
    const song = this.makeSong(title, artist, duration, audioUrl, file);
    this.dll.addFirst(song);
    if (!this.currentNode) this.currentNode = this.dll.head;
    return song;
  }

  addLast(title: string, artist: string, duration: string, audioUrl?: string, file?: File): Song {
    const song = this.makeSong(title, artist, duration, audioUrl, file);
    this.dll.addLast(song);
    if (!this.currentNode) this.currentNode = this.dll.head;
    return song;
  }

  addAt(title: string, artist: string, duration: string, position: number, audioUrl?: string, file?: File): Song {
    const song = this.makeSong(title, artist, duration, audioUrl, file);
    this.dll.addAt(song, position);
    if (!this.currentNode) this.currentNode = this.dll.head;
    return song;
  }

  // ── Remove song ─────────────────────────────────────────
  remove(id: number): boolean {
    if (this.currentNode?.data.id === id) {
      this.currentNode =
        this.currentNode.next ??
        this.currentNode.prev ??
        null;
    }
    return this.dll.removeById(id) !== null;
  }

  // ── Navigation ──────────────────────────────────────────
  next(): boolean {
    if (this.currentNode?.next) {
      this.currentNode = this.currentNode.next;
      return true;
    }
    // Loop back to start if loop active
    if (this.isLooping && this.dll.size > 0) {
      this.currentNode = this.dll.head;
      return true;
    }
    return false;
  }

  prev(): boolean {
    if (this.currentNode?.prev) {
      this.currentNode = this.currentNode.prev;
      return true;
    }
    // Loop back to end if loop active
    if (this.isLooping && this.dll.size > 0) {
      this.currentNode = this.dll.tail;
      return true;
    }
    return false;
  }

  toggleLoop(): void {
    this.isLooping = !this.isLooping;
  }

  toggleShuffle(): void {
    this.isShuffled = !this.isShuffled;
    if (this.isShuffled) {
      const currentId = this.getCurrent()?.id;
      this.dll.shuffle();
      if (currentId !== undefined) {
        this.selectById(currentId);
      }
    }
  }

  selectById(id: number): boolean {
    const node = this.dll.findById(id);
    if (node) {
      this.currentNode = node;
      return true;
    }
    return false;
  }

  // ── Getters ─────────────────────────────────────────────
  getCurrent(): Song | null {
    return this.currentNode?.data ?? null;
  }

  getAll(): Song[] {
    return this.dll.toArray();
  }

  /** Songs coming AFTER the current one (queue / up-next) */
  getUpNext(): Song[] {
    if (!this.currentNode?.next) return [];
    return this.dll.fromNode(this.currentNode.next);
  }

  get size(): number {
    return this.dll.size;
  }

  getPrevTitle(): string {
    return this.currentNode?.prev?.data?.title ?? "null";
  }

  getNextTitle(): string {
    return this.currentNode?.next?.data?.title ?? "null";
  }
}