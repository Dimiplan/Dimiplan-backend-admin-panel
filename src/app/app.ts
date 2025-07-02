import { CommonModule } from '@angular/common';
import { Component, inject, type OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterModule, RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-root',
    imports: [
        CommonModule,
        RouterOutlet,
        RouterModule,
        MatToolbarModule,
        MatSidenavModule,
        MatListModule,
        MatIconModule,
        MatButtonModule,
        MatMenuModule,
        MatDividerModule,
    ],
    templateUrl: './app.html',
    styleUrl: './app.scss',
})
export class App implements OnInit {
    router = inject(Router);

    protected title = 'Dimiplan 관리자 패널';
    sidenavOpened = true;
    isDarkMode = false;
    private isMobile = false;

    ngOnInit() {
        // Check for saved theme preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            this.isDarkMode = true;
            document.documentElement.setAttribute('data-theme', 'dark');
        }

        // Check if mobile and set the initial sidebar state
        this.checkMobile();
        window.addEventListener('resize', () => this.checkMobile());
    }

    private checkMobile() {
        this.isMobile = window.innerWidth < 1024;
        this.sidenavOpened = !this.isMobile;
    }

    toggleSidenav() {
        this.sidenavOpened = !this.sidenavOpened;
    }
}
