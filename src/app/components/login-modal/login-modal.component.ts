import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-login-modal',
    standalone: true,
    imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
	templateUrl: './login-modal.component.html',
    styles: [`
        .md-button {
            border: none;
            cursor: pointer;
            text-decoration: none;
            transition: all 0.2s ease;
        }

        .md-button:hover {
            transform: translateY(-1px);
            filter: brightness(1.1);
        }
    `]
})
export class LoginModalComponent {
    constructor(
        public dialogRef: MatDialogRef<LoginModalComponent>,
    ) {}

    loginWithGoogle(): void {
     	window.location.href = `https://api-dev.dimiplan.com/auth/google?returnUrl=admin.dimiplan.com`;
    }
}
