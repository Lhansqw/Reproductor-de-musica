// src/data-structures/DoublyLinkedList.ts

import { Song } from "../models/Song";

export class Node {
  data: Song;
  prev: Node | null = null;
  next: Node | null = null;

  constructor(data: Song) {
    this.data = data;
  }
}

export class DoublyLinkedList {
  head: Node | null = null;
  tail: Node | null = null;
  private _size: number = 0;

  get size(): number {
    return this._size;
  }

  // ── Insert at beginning ─────────────────────────────────
  addFirst(song: Song): void {
    const node = new Node(song);
    if (!this.head) {
      this.head = this.tail = node;
    } else {
      node.next = this.head;
      this.head.prev = node;
      this.head = node;
    }
    this._size++;
  }

  // ── Insert at end ───────────────────────────────────────
  addLast(song: Song): void {
    const node = new Node(song);
    if (!this.tail) {
      this.head = this.tail = node;
    } else {
      node.prev = this.tail;
      this.tail.next = node;
      this.tail = node;
    }
    this._size++;
  }

  // ── Insert at specific position (0-indexed) ─────────────
  addAt(song: Song, position: number): void {
    if (position <= 0) return this.addFirst(song);
    if (position >= this._size) return this.addLast(song);

    const node = new Node(song);
    let current = this.head!;
    for (let i = 0; i < position - 1; i++) {
      current = current.next!;
    }
    const after = current.next;
    node.prev = current;
    node.next = after;
    current.next = node;
    if (after) after.prev = node;
    this._size++;
  }

  // ── Remove node by ID ───────────────────────────────────
  removeById(id: number): Node | null {
    let current = this.head;
    while (current) {
      if (current.data.id === id) {
        if (current.prev) current.prev.next = current.next;
        else this.head = current.next;
        if (current.next) current.next.prev = current.prev;
        else this.tail = current.prev;
        current.prev = null;
        current.next = null;
        this._size--;
        return current;
      }
      current = current.next;
    }
    return null;
  }

  // ── Find node by ID ─────────────────────────────────────
  findById(id: number): Node | null {
    let current = this.head;
    while (current) {
      if (current.data.id === id) return current;
      current = current.next;
    }
    return null;
  }

  // ── Export list as array ────────────────────────────────
  toArray(): Song[] {
    const result: Song[] = [];
    let current = this.head;
    while (current) {
      result.push(current.data);
      current = current.next;
    }
    return result;
  }

  // ── Traverse forward from a given node ──────────────────
  fromNode(node: Node | null): Song[] {
    const result: Song[] = [];
    let current = node;
    while (current) {
      result.push(current.data);
      current = current.next;
    }
    return result;
  }

  // ── Shuffle ─────────────────────────────────────────────
  shuffle(): void {
    if (this._size <= 1) return;
    const items = this.toArray();
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    
    // Rebuild list
    this.head = null;
    this.tail = null;
    this._size = 0;
    
    for (const song of items) {
      this.addLast(song);
    }
  }
}