import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonItem, IonLabel, IonInput, IonTextarea, IonButton,
  IonButtons, IonBackButton, IonIcon, IonNote,
  IonGrid, IonRow, IonCol, IonText, IonCard, IonCardContent, IonCardHeader, IonCardTitle,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { save, trash, arrowBack, person, fish, cash, location } from 'ionicons/icons';
import { TamuService, Tamu } from '../services/tamu.service';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonItem, IonLabel, IonInput, IonTextarea, IonButton,
    IonButtons, IonBackButton, IonIcon, IonNote,
    IonGrid, IonRow, IonCol, IonText, IonCard, IonCardContent, IonCardHeader, IonCardTitle
  ],
  templateUrl: './form.page.html',
  styleUrls: ['./form.page.scss'],
})
export class FormPage implements OnInit {
  isEdit = false;
  editId = '';

  model = { nama: '', beras: null as number | null, uang: null as number | null, alamat: '' };

  submitted = false;

  constructor(
    private tamuService: TamuService,
    private router: Router,
    private toastCtrl: ToastController
  ) {
    addIcons({ save, trash, arrowBack, person, fish, cash, location });
  }

  ngOnInit() {
    const nav = history.state;
    if (nav?.tamu) {
      const t: Tamu = nav.tamu;
      this.isEdit = true;
      this.editId = t.id;
      this.model = { nama: t.nama, beras: t.beras || null, uang: t.uang || null, alamat: t.alamat || '' };
    }
  }

  async simpan() {
    this.submitted = true;
    if (!this.model.nama.trim()) return;

    const data = {
      nama: this.model.nama.trim(),
      beras: this.model.beras ?? 0,
      uang: this.model.uang ?? 0,
      alamat: this.model.alamat.trim(),
    };

    if (this.isEdit) {
      this.tamuService.update(this.editId, data);
    } else {
      this.tamuService.add(data);
    }

    const toast = await this.toastCtrl.create({
      message: this.isEdit ? 'Data berhasil diperbarui! ✅' : 'Tamu berhasil ditambahkan! ✅',
      duration: 2000,
      position: 'bottom',
      color: 'success',
    });
    await toast.present();
    this.router.navigate(['/'], { replaceUrl: true });
  }

  batal() {
    this.router.navigate(['/']);
  }

  getInitials(nama: string): string {
    return nama.trim().split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');
  }
}
