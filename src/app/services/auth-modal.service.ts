import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LoginModalComponent } from '../components/login-modal/login-modal.component';

@Injectable({
  providedIn: 'root'
})
export class AuthModalService {
  constructor(private dialog: MatDialog) {}

  openLoginModal(): void {
    const currentUrl = window.location.pathname + window.location.search;
    
    this.dialog.open(LoginModalComponent, {
      data: { returnUrl: currentUrl },
      disableClose: true,
      width: '400px',
      panelClass: 'login-modal'
    });
  }
}