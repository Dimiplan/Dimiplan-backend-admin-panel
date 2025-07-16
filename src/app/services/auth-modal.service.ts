import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LoginModalComponent } from '../components/login-modal/login-modal.component';

@Injectable({
  providedIn: 'root',
})
export class AuthModalService {
  private dialog = inject(MatDialog);
  private document = inject(DOCUMENT);

  openLoginModal(): void {
    // Open the login modal dialog
    this.dialog.open(LoginModalComponent, {
      disableClose: true,
      width: '400px',
      panelClass: 'login-modal',
    });
  }
  redirectToForbiddenPage(): void {
    this.document.location.href = 'https://dimiplan.com/';
  }
}
