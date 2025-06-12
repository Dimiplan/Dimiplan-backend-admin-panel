import { Component, ViewChild } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
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
  template: `
    <div class="admin-layout">
      <mat-toolbar color="primary" class="header" elevation="1">
        <button mat-icon-button (click)="toggleSidenav()" aria-label="Toggle navigation">
          <mat-icon>menu</mat-icon>
        </button>
        <span class="title">Dimiplan 관리자 패널</span>
        <span class="spacer"></span>
        
        <button mat-icon-button [matMenuTriggerFor]="userMenu" aria-label="User menu">
          <mat-icon>account_circle</mat-icon>
        </button>
        
        <mat-menu #userMenu="matMenu" xPosition="before">
          <button mat-menu-item>
            <mat-icon>person</mat-icon>
            <span>프로필</span>
          </button>
          <button mat-menu-item>
            <mat-icon>settings</mat-icon>
            <span>설정</span>
          </button>
          <mat-divider></mat-divider>
          <button mat-menu-item>
            <mat-icon>logout</mat-icon>
            <span>로그아웃</span>
          </button>
        </mat-menu>
      </mat-toolbar>

      <mat-sidenav-container class="sidenav-container">
        <mat-sidenav #sidenav mode="side" opened class="sidenav" fixedInViewport="true">
          <div class="sidenav-header">
            <h3>관리 메뉴</h3>
          </div>
          
          <mat-nav-list>
            <a mat-list-item routerLink="/dashboard" routerLinkActive="active" class="nav-item">
              <mat-icon matListItemIcon>dashboard</mat-icon>
              <span matListItemTitle>대시보드</span>
            </a>
            <a mat-list-item routerLink="/logs" routerLinkActive="active" class="nav-item">
              <mat-icon matListItemIcon>article</mat-icon>
              <span matListItemTitle>로그 관리</span>
            </a>
            <a mat-list-item routerLink="/database" routerLinkActive="active" class="nav-item">
              <mat-icon matListItemIcon>storage</mat-icon>
              <span matListItemTitle>데이터베이스</span>
            </a>
            <a mat-list-item routerLink="/api-docs" routerLinkActive="active" class="nav-item">
              <mat-icon matListItemIcon>code</mat-icon>
              <span matListItemTitle>API 문서</span>
            </a>
          </mat-nav-list>
          
          <mat-divider></mat-divider>
          
          <div class="sidenav-footer">
            <small>버전 1.0.0</small>
          </div>
        </mat-sidenav>

        <mat-sidenav-content class="main-content">
          <router-outlet></router-outlet>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
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
export class App {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  protected title = 'Dimiplan 관리자 패널';

  constructor(private router: Router) {}

  toggleSidenav() {
    this.sidenav.toggle();
  }
}
