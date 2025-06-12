import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <div class="admin-layout">
      <mat-toolbar color="primary" class="header">
        <button mat-icon-button (click)="toggleSidenav()">
          <mat-icon>menu</mat-icon>
        </button>
        <span class="title">Dimiplan 관리자 패널</span>
        <span class="spacer"></span>
        <button mat-icon-button>
          <mat-icon>account_circle</mat-icon>
        </button>
      </mat-toolbar>

      <mat-sidenav-container class="sidenav-container">
        <mat-sidenav #sidenav mode="side" opened class="sidenav">
          <mat-nav-list>
            <a mat-list-item routerLink="/dashboard" routerLinkActive="active">
              <mat-icon matListItemIcon>dashboard</mat-icon>
              <span matListItemTitle>대시보드</span>
            </a>
            <a mat-list-item routerLink="/logs" routerLinkActive="active">
              <mat-icon matListItemIcon>description</mat-icon>
              <span matListItemTitle>로그 관리</span>
            </a>
            <a mat-list-item routerLink="/database" routerLinkActive="active">
              <mat-icon matListItemIcon>storage</mat-icon>
              <span matListItemTitle>데이터베이스</span>
            </a>
            <a mat-list-item routerLink="/api-docs" routerLinkActive="active">
              <mat-icon matListItemIcon>api</mat-icon>
              <span matListItemTitle>API 문서</span>
            </a>
          </mat-nav-list>
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
    }

    .title {
      font-size: 1.25rem;
      font-weight: 500;
    }

    .spacer {
      flex: 1;
    }

    .sidenav-container {
      flex: 1;
      margin-top: 64px;
    }

    .sidenav {
      width: 250px;
      background-color: #fafafa;
    }

    .main-content {
      padding: 0;
      background-color: #f5f5f5;
    }

    .active {
      background-color: rgba(63, 81, 181, 0.1);
      color: #3f51b5;
    }

    .active mat-icon {
      color: #3f51b5;
    }

    mat-nav-list a {
      margin: 4px 8px;
      border-radius: 4px;
    }

    mat-nav-list a:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }
  `]
})
export class App {
  protected title = 'Dimiplan 관리자 패널';

  constructor(private router: Router) {}

  toggleSidenav() {
    // 사이드네비게이션 토글 기능 (필요시 구현)
  }
}
