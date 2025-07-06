import { baseUrl } from './../../services/base-url';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './login-modal.component.html',
})
export class LoginModalComponent {
  dialogRef = inject<MatDialogRef<LoginModalComponent>>(MatDialogRef);

  loginWithGoogle(): void {
    window.location.href = `${baseUrl}/auth/google`;
  }
}
