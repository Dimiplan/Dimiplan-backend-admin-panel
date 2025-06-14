import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { RouterModule } from '@angular/router';

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
        MatDividerModule
    ],
    templateUrl: './app.html',
    styles: [`
        .admin-layout {
            height: 100vh;
            display: flex;
            flex-direction: column;
        }

        .header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 1000;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .title {
            font-size: 1.375rem;
            font-weight: 500;
            margin-left: 8px;
        }

        .spacer {
            flex: 1;
        }

        .sidenav-container {
            flex: 1;
            margin-top: 64px;
        }

        .sidenav {
            width: 280px;
            background-color: var(--mat-sidenav-container-background-color, #fafafa);
            border-right: 1px solid var(--mat-sidenav-container-divider-color, #e0e0e0);
        }

        .sidenav-header {
            padding: 24px 16px 16px;
            border-bottom: 1px solid var(--mat-sidenav-container-divider-color, #e0e0e0);
        }

        .sidenav-header h3 {
            margin: 0;
            font-size: 1.125rem;
            font-weight: 500;
            color: var(--mat-sidenav-container-text-color, rgba(0, 0, 0, 0.87));
        }

        .sidenav-footer {
            position: absolute;
            bottom: 16px;
            left: 16px;
            right: 16px;
            text-align: center;
            color: var(--mat-sidenav-container-text-color, rgba(0, 0, 0, 0.6));
        }

        .main-content {
            padding: 0;
            background-color: var(--mat-app-background-color, #fafafa);
        }

        .nav-item {
            margin: 4px 12px;
            border-radius: 12px !important;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .nav-item:hover {
            background-color: var(--mat-sidenav-container-background-color, rgba(0, 0, 0, 0.04)) !important;
        }

        .nav-item.active {
            background-color: var(--mat-primary-color, #1976d2) !important;
            color: var(--mat-primary-contrast-color, white) !important;
        }

        .nav-item.active mat-icon {
            color: var(--mat-primary-contrast-color, white) !important;
        }

        .nav-item.active span {
            color: var(--mat-primary-contrast-color, white) !important;
            font-weight: 500;
        }

        mat-nav-list {
            padding-top: 8px;
        }

        mat-divider {
            margin: 16px 0;
        }
    `]
})
export class App implements OnInit {
    protected title = 'Dimiplan 관리자 패널';
    sidenavOpened = true;
    isDarkMode = false;
    private isMobile = false;

    constructor(public router: Router) {}

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

    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        if (this.isDarkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
        }
    }
}
