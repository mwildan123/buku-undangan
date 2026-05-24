import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonSearchbar,
  IonList, IonItem, IonLabel, IonNote, IonBadge, IonAvatar,
  IonFab, IonFabButton, IonIcon, IonButtons, IonButton,
  IonCard, IonCardContent, IonGrid, IonRow, IonCol,
  IonItemSliding, IonItemOptions, IonItemOption,
  IonSkeletonText, IonText
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  add, create, trash, people, fish, cash, location,
  searchOutline, chevronForwardOutline, scanOutline, cameraOutline
} from 'ionicons/icons';
import { TamuService, Tamu } from '../services/tamu.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonSearchbar,
    IonList, IonItem, IonLabel, IonNote, IonBadge, IonAvatar,
    IonFab, IonFabButton, IonIcon, IonButtons, IonButton,
    IonCard, IonCardContent, IonGrid, IonRow, IonCol,
    IonItemSliding, IonItemOptions, IonItemOption,
    IonSkeletonText, IonText
  ],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  allTamu: Tamu[] = [];
  filteredTamu: Tamu[] = [];
  searchQuery = '';
  stats = { totalTamu: 0, totalBeras: 0, totalUang: 0 };

  constructor(private tamuService: TamuService, private router: Router) {
    addIcons({ add, create, trash, people, fish, cash, location, searchOutline, chevronForwardOutline, scanOutline, cameraOutline });
  }

  ngOnInit() { this.loadData(); }
  ionViewWillEnter() { this.loadData(); }

  loadData() {
    this.allTamu = this.tamuService.getAll();
    this.stats = this.tamuService.getStats();
    this.applyFilter();
  }

  applyFilter() {
    const q = this.searchQuery.toLowerCase().trim();
    this.filteredTamu = q
      ? this.allTamu.filter(t => t.nama.toLowerCase().includes(q) || (t.alamat || '').toLowerCase().includes(q))
      : [...this.allTamu];
  }

  onSearch(event: any) { this.searchQuery = event.detail.value ?? ''; this.applyFilter(); }

  tambahTamu() { this.router.navigate(['/form']); }
  goScan() { this.router.navigate(['/scan']); }

  editTamu(tamu: Tamu, sliding?: any) {
    sliding?.close();
    this.router.navigate(['/form'], { state: { tamu } });
  }

  async hapusTamu(tamu: Tamu, sliding?: any) {
    sliding?.close();
    const alert = document.createElement('ion-alert');
    alert.header = 'Hapus Data';
    alert.message = `Yakin hapus data "${tamu.nama}"?`;
    alert.buttons = [
      { text: 'Batal', role: 'cancel' },
      { text: 'Hapus', role: 'destructive', handler: () => { this.tamuService.delete(tamu.id); this.loadData(); } }
    ];
    document.body.appendChild(alert);
    await alert.present();
  }

  getInitials(nama: string): string {
    return nama.trim().split(' ').slice(0, 2).map(w => w[0].toUpperCase()).join('');
  }

  formatUang(v: number): string { return v ? 'Rp ' + v.toLocaleString('id-ID') : ''; }
  formatBeras(v: number): string { return v ? v + ' kg' : ''; }
  formatUangShort(v: number): string {
    if (v >= 1_000_000) return 'Rp ' + (v / 1_000_000).toFixed(1) + ' jt';
    if (v >= 1_000) return 'Rp ' + (v / 1_000).toFixed(0) + ' rb';
    return 'Rp ' + v;
  }
}
