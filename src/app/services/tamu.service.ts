import { Injectable } from '@angular/core';

export interface Tamu {
  id: string;
  nama: string;
  beras: number;
  uang: number;
  alamat: string;
  createdAt: number;
}

@Injectable({ providedIn: 'root' })
export class TamuService {
  private readonly STORAGE_KEY = 'buku_undangan_tamu';

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }

  getAll(): Tamu[] {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  add(data: Omit<Tamu, 'id' | 'createdAt'>): Tamu {
    const list = this.getAll();
    const tamu: Tamu = { ...data, id: this.generateId(), createdAt: Date.now() };
    list.unshift(tamu);
    this.save(list);
    return tamu;
  }

  update(id: string, data: Omit<Tamu, 'id' | 'createdAt'>): void {
    const list = this.getAll();
    const idx = list.findIndex(t => t.id === id);
    if (idx > -1) {
      list[idx] = { ...list[idx], ...data };
      this.save(list);
    }
  }

  delete(id: string): void {
    const list = this.getAll().filter(t => t.id !== id);
    this.save(list);
  }

  getStats() {
    const list = this.getAll();
    return {
      totalTamu: list.length,
      totalBeras: list.reduce((s, t) => s + (t.beras || 0), 0),
      totalUang: list.reduce((s, t) => s + (t.uang || 0), 0),
    };
  }

  private save(list: Tamu[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
  }
}
