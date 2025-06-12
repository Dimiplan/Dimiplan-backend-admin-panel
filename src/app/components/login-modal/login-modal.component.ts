import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="login-modal-container">
      <div class="login-header">
        <h2 mat-dialog-title>인증이 필요합니다</h2>
        <mat-icon class="warning-icon">warning</mat-icon>
      </div>

      <div mat-dialog-content class="login-content">
        <p>관리자 패널에 접근하려면 구글 계정으로 로그인해야 합니다.</p>
        <p class="return-info">로그인 후 현재 페이지로 돌아갑니다.</p>
      </div>

      <div mat-dialog-actions class="login-actions">
        <button mat-raised-button color="primary" (click)="loginWithGoogle()">
          <mat-icon>login</mat-icon>
          구글로 로그인
        </button>
      </div>
    </div>
  `,
  styles: [`
    .login-modal-container {
      padding: 20px;
      text-align: center;
    }

    .login-header {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin-bottom: 20px;
    }

    .warning-icon {
      color: #ff9800;
      font-size: 24px;
    }

    .login-content {
      margin-bottom: 20px;
    }

    .return-info {
      font-size: 0.9em;
      color: #666;
      margin-top: 10px;
    }

    .login-actions {
      display: flex;
      justify-content: center;
    }

    .login-actions button {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  `]
})
export class LoginModalComponent {
  constructor(
    public dialogRef: MatDialogRef<LoginModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { returnUrl: string }
  ) {}

  loginWithGoogle(): void {
    const baseUrl = 'https://api-dev.dimiplan.com';
    const adminPanelUrl = window.location.origin;
    const returnUrl = encodeURIComponent(`${adminPanelUrl}${this.data.returnUrl}`);

    window.location.href = `${baseUrl}/auth/google?returnUrl=${returnUrl}`;
  }
}
