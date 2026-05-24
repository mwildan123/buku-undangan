import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonBackButton, IonButton, IonIcon, IonList, IonItem,
  IonLabel, IonCheckbox, IonNote, IonBadge, IonSpinner,
  IonCard, IonCardContent, IonText, IonFooter, IonToolbar as IonFooterToolbar,
  ToastController, IonProgressBar
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  camera, image, scanOutline, checkmarkCircle, closeCircle,
  arrowBack, cloudUploadOutline, checkmarkDoneOutline, refreshOutline,
  alertCircleOutline, imagesOutline
} from 'ionicons/icons';
import { TamuService, Tamu } from '../services/tamu.service';

interface TamuResult {
  nama: string;
  beras: number;
  uang: number;
  alamat: string;
  selected: boolean;
  valid: boolean;
}

type ScanState = 'idle' | 'preview' | 'scanning' | 'result' | 'error';

@Component({
  selector: 'app-scan',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonBackButton, IonButton, IonIcon, IonList, IonItem,
    IonLabel, IonCheckbox, IonNote, IonBadge, IonSpinner,
    IonCard, IonCardContent, IonText, IonFooter, IonProgressBar
  ],
  templateUrl: './scan.page.html',
  styleUrls: ['./scan.page.scss'],
})
export class ScanPage {
  state: ScanState = 'idle';
  imagePreview: string | null = null;
  imageBase64: string | null = null;
  results: TamuResult[] = [];
  errorMsg = '';
  statusMsg = '';
  progressValue = 0;

  constructor(
    private tamuService: TamuService,
    private router: Router,
    private toastCtrl: ToastController,
  ) {
    addIcons({
      camera, image, scanOutline, checkmarkCircle, closeCircle,
      arrowBack, cloudUploadOutline, checkmarkDoneOutline, refreshOutline,
      alertCircleOutline, imagesOutline
    });
  }

  // Trigger file input (kamera atau galeri)
  openCamera() {
    const input = document.getElementById('cameraInput') as HTMLInputElement;
    input.setAttribute('capture', 'environment');
    input.click();
  }

  openGallery() {
    const input = document.getElementById('cameraInput') as HTMLInputElement;
    input.removeAttribute('capture');
    input.click();
  }

  async onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    // Resize & convert to base64
    const base64 = await this.resizeAndConvert(file);
    this.imageBase64 = base64.split(',')[1];
    this.imagePreview = base64;
    this.state = 'preview';

    // Reset input
    (event.target as HTMLInputElement).value = '';
  }

  private resizeAndConvert(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX = 1280;
          let w = img.width, h = img.height;
          if (w > MAX || h > MAX) {
            if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
            else { w = Math.round(w * MAX / h); h = MAX; }
          }
          canvas.width = w; canvas.height = h;
          canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.src = e.target!.result as string;
      };
      reader.readAsDataURL(file);
    });
  }

  async startScan() {
    if (!this.imageBase64) return;
    this.state = 'scanning';
    this.progressValue = 0;

    const progress = setInterval(() => {
      if (this.progressValue < 0.85) this.progressValue += 0.07;
    }, 400);

    const prompt = `Kamu adalah asisten yang membaca buku catatan undangan pernikahan/hajatan.
Dari foto ini, ekstrak semua baris data tamu yang terlihat.
Setiap tamu biasanya memiliki: nama, jumlah beras (kg), jumlah uang (Rupiah), dan alamat.
Format penulisan di buku bisa bervariasi — kolom, tabel, atau tulisan bebas.

Kembalikan HANYA JSON array seperti ini (tanpa teks lain):
[
  {"nama":"Ahmad Fauzi","beras":5,"uang":100000,"alamat":"Desa Sukamaju RT 01"},
  {"nama":"Siti Aisyah","beras":0,"uang":200000,"alamat":""}
]

Aturan:
- Jika kolom tidak ada / tidak terbaca, gunakan 0 untuk angka dan "" untuk teks
- beras dan uang harus angka (bukan string)
- Jika tidak ada data tamu sama sekali, kembalikan []
- Abaikan header tabel, nomor baris, atau tulisan yang bukan data tamu`;

    try {
      this.statusMsg = 'Membaca tulisan di foto...';
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2000,
          messages: [{
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: this.imageBase64 } },
              { type: 'text', text: prompt }
            ]
          }]
        })
      });

      clearInterval(progress);
      this.progressValue = 1;

      const data = await resp.json();
      const text = data.content?.map((c: any) => c.text || '').join('') ?? '';

      let parsed: any[] = [];
      try {
        const clean = text.replace(/```json|```/g, '').trim();
        parsed = JSON.parse(clean);
      } catch {
        // Try to extract JSON array from text
        const match = text.match(/\[[\s\S]*\]/);
        if (match) parsed = JSON.parse(match[0]);
      }

      if (!Array.isArray(parsed) || parsed.length === 0) {
        this.state = 'error';
        this.errorMsg = 'Tidak ada data tamu yang terdeteksi.\nCoba foto dengan pencahayaan lebih terang atau tulisan lebih jelas.';
        return;
      }

      this.results = parsed.map((t: any) => ({
        nama: String(t.nama || '').trim(),
        beras: Number(t.beras) || 0,
        uang: Number(t.uang) || 0,
        alamat: String(t.alamat || '').trim(),
        selected: true,
        valid: Boolean(String(t.nama || '').trim()),
      }));

      this.state = 'result';

    } catch (err: any) {
      clearInterval(progress);
      this.state = 'error';
      this.errorMsg = 'Gagal memproses gambar. Periksa koneksi internet dan coba lagi.';
    }
  }

  get selectedCount() { return this.results.filter(r => r.selected && r.valid).length; }
  get allSelected() { return this.results.every(r => r.selected); }

  toggleAll(checked: boolean) { this.results.forEach(r => { if (r.valid) r.selected = checked; }); }

  async simpanDipilih() {
    const toSave = this.results.filter(r => r.selected && r.valid);
    if (toSave.length === 0) return;
    toSave.forEach(t => this.tamuService.add({ nama: t.nama, beras: t.beras, uang: t.uang, alamat: t.alamat }));
    const toast = await this.toastCtrl.create({
      message: `✅ ${toSave.length} tamu berhasil ditambahkan!`,
      duration: 2500, position: 'bottom', color: 'success'
    });
    await toast.present();
    this.router.navigate(['/'], { replaceUrl: true });
  }

  reset() { this.state = 'idle'; this.imagePreview = null; this.imageBase64 = null; this.results = []; this.errorMsg = ''; }

  formatUang(v: number) { return v ? 'Rp ' + v.toLocaleString('id-ID') : '-'; }
  formatBeras(v: number) { return v ? v + ' kg' : '-'; }
}
