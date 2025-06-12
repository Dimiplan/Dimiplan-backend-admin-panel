import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { AdminService, SystemStatus, UserStats } from '../../services/admin.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatGridListModule,
    MatProgressBarModule,
    MatChipsModule
  ],
  template: `
    <div class="dashboard-container">
      <h1>관리자 대시보드</h1>
      
      <mat-grid-list cols="3" rowHeight="300px" gutterSize="16px">
        <!-- 시스템 상태 카드 -->
        <mat-grid-tile>
          <mat-card class="dashboard-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>computer</mat-icon>
                시스템 상태
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div *ngIf="systemStatus" class="status-info">
                <div class="status-item">
                  <span class="label">가동 시간:</span>
                  <span class="value">{{ formatUptime(systemStatus.uptime) }}</span>
                </div>
                <div class="status-item">
                  <span class="label">메모리 사용량:</span>
                  <span class="value">{{ formatMemory(systemStatus.memory.heapUsed) }} / {{ formatMemory(systemStatus.memory.heapTotal) }}</span>
                </div>
                <div class="status-item">
                  <span class="label">플랫폼:</span>
                  <span class="value">{{ systemStatus.platform }}</span>
                </div>
                <div class="status-item">
                  <span class="label">Node.js 버전:</span>
                  <span class="value">{{ systemStatus.nodeVersion }}</span>
                </div>
                <div class="status-item">
                  <span class="label">환경:</span>
                  <mat-chip [color]="systemStatus.environment === 'production' ? 'warn' : 'primary'">
                    {{ systemStatus.environment }}
                  </mat-chip>
                </div>
                <mat-progress-bar 
                  mode="determinate" 
                  [value]="getMemoryUsagePercent()"
                  color="primary">
                </mat-progress-bar>
              </div>
              <div *ngIf="!systemStatus" class="loading">
                시스템 정보를 불러오는 중...
              </div>
            </mat-card-content>
          </mat-card>
        </mat-grid-tile>

        <!-- 사용자 통계 카드 -->
        <mat-grid-tile>
          <mat-card class="dashboard-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>people</mat-icon>
                사용자 통계
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div *ngIf="userStats" class="stats-info">
                <div class="stat-item">
                  <div class="stat-number">{{ userStats.totalUsers }}</div>
                  <div class="stat-label">총 사용자</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number">{{ userStats.activeUsers }}</div>
                  <div class="stat-label">활성 사용자 (30일)</div>
                </div>
                <div class="recent-users">
                  <h4>최근 가입자</h4>
                  <div *ngFor="let user of userStats.recentUsers.slice(0, 5)" class="user-item">
                    <span class="user-email">{{ user.email }}</span>
                    <span class="user-date">{{ formatDate(user.created_at) }}</span>
                  </div>
                </div>
              </div>
              <div *ngIf="!userStats" class="loading">
                사용자 통계를 불러오는 중...
              </div>
            </mat-card-content>
          </mat-card>
        </mat-grid-tile>

        <!-- 빠른 액션 카드 -->
        <mat-grid-tile>
          <mat-card class="dashboard-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>quick_reference</mat-icon>
                빠른 액션
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="action-buttons">
                <button mat-raised-button color="primary" (click)="navigateToLogs()">
                  <mat-icon>description</mat-icon>
                  로그 보기
                </button>
                <button mat-raised-button color="accent" (click)="navigateToDatabase()">
                  <mat-icon>storage</mat-icon>
                  데이터베이스
                </button>
                <button mat-raised-button (click)="navigateToApiDocs()">
                  <mat-icon>api</mat-icon>
                  API 문서
                </button>
                <button mat-raised-button (click)="refreshData()">
                  <mat-icon>refresh</mat-icon>
                  새로고침
                </button>
              </div>
            </mat-card-content>
          </mat-card>
        </mat-grid-tile>
      </mat-grid-list>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
    }

    .dashboard-card {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .dashboard-card mat-card-header {
      margin-bottom: 16px;
    }

    .dashboard-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .dashboard-card mat-card-content {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .status-info, .stats-info {
      display: flex;
      flex-direction: column;
      gap: 8px;
      flex: 1;
    }

    .status-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .status-item .label {
      font-weight: 500;
      color: rgba(0, 0, 0, 0.7);
    }

    .status-item .value {
      font-family: monospace;
    }

    .stat-item {
      text-align: center;
      padding: 16px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
    }

    .stat-number {
      font-size: 2rem;
      font-weight: bold;
      color: #1976d2;
    }

    .stat-label {
      font-size: 0.9rem;
      color: rgba(0, 0, 0, 0.7);
    }

    .recent-users {
      margin-top: 16px;
    }

    .recent-users h4 {
      margin: 0 0 8px 0;
      font-size: 0.9rem;
      color: rgba(0, 0, 0, 0.7);
    }

    .user-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4px 0;
      font-size: 0.8rem;
    }

    .user-email {
      font-weight: 500;
    }

    .user-date {
      color: rgba(0, 0, 0, 0.5);
    }

    .action-buttons {
      display: flex;
      flex-direction: column;
      gap: 12px;
      flex: 1;
    }

    .action-buttons button {
      justify-content: flex-start;
      gap: 8px;
    }

    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      flex: 1;
      color: rgba(0, 0, 0, 0.5);
    }

    mat-progress-bar {
      margin-top: 16px;
    }
  `]
})
export class DashboardComponent implements OnInit {
  systemStatus: SystemStatus | null = null;
  userStats: UserStats | null = null;

  constructor(private adminService: AdminService, private router: Router) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loadSystemStatus();
    this.loadUserStats();
  }

  loadSystemStatus() {
    this.adminService.getSystemStatus().subscribe({
      next: (response) => {
        if (response.success) {
          this.systemStatus = response.data;
        }
      },
      error: (error) => {
        console.error('시스템 상태 로드 실패:', error);
      }
    });
  }

  loadUserStats() {
    this.adminService.getUserStats().subscribe({
      next: (response) => {
        if (response.success) {
          this.userStats = response.data;
        }
      },
      error: (error) => {
        console.error('사용자 통계 로드 실패:', error);
      }
    });
  }

  formatUptime(uptime: number): string {
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    return `${hours}h ${minutes}m ${seconds}s`;
  }

  formatMemory(bytes: number): string {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  }

  getMemoryUsagePercent(): number {
    if (!this.systemStatus) return 0;
    return (this.systemStatus.memory.heapUsed / this.systemStatus.memory.heapTotal) * 100;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('ko-KR');
  }

  navigateToLogs() {
    this.router.navigate(['/logs']);
  }

  navigateToDatabase() {
    this.router.navigate(['/database']);
  }

  navigateToApiDocs() {
    this.router.navigate(['/api-docs']);
  }

  refreshData() {
    this.systemStatus = null;
    this.userStats = null;
    this.loadData();
  }
}