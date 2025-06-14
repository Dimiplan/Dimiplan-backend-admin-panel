import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LoginModalComponent } from '../components/login-modal/login-modal.component';

@Injectable({
    providedIn: 'root'
})
export class AuthModalService {
    constructor(private dialog: MatDialog) {}

    openLoginModal(): void {
        // Open the login modal dialog
        this.dialog.open(LoginModalComponent, {
            disableClose: true,
            width: '400px',
            panelClass: 'login-modal'
        });
    }
}
