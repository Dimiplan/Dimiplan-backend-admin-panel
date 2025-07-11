import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { baseUrl } from './../../services/base-url';
@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './login-modal.component.html',
})
export class LoginModalComponent {
  dialogRef = inject<MatDialogRef<LoginModalComponent>>(MatDialogRef);

  loginWithGoogle(): void {
    window.location.href = `${baseUrl.replace('/admin', '/auth')}/admin/google`;
  }
}
