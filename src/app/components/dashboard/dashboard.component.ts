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
    <div class="dashboard-container p-6 bg-md-sys-color-surface min-h-screen">
      <h1 class="md-typescale-headline-large text-md-sys-color-on-surface mb-6">관리자 대시보드</h1>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- 시스템 상태 카드 -->
        <div class="md-card bg-md-sys-color-surface-container text-md-sys-color-on-surface hover:shadow-elevation-3 transition-all duration-300">
          <div class="flex items-center gap-3 mb-4">
            <mat-icon class="w-6 h-6 text-md-sys-color-primary">monitor</mat-icon>
            <h2 class="md-typescale-title-large text-md-sys-color-on-surface">시스템 상태</h2>
          </div>
          <div class="flex-1">
            <div *ngIf="systemStatus" class="space-y-4">
              <div class="flex justify-between items-center py-2 border-b border-md-sys-color-outline-variant">
                <span class="md-typescale-body-medium font-medium text-md-sys-color-on-surface-variant">가동 시간:</span>
                <span class="md-typescale-body-medium font-mono text-md-sys-color-on-surface">{{ formatUptime(systemStatus.uptime) }}</span>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-md-sys-color-outline-variant">
                <span class="md-typescale-body-medium font-medium text-md-sys-color-on-surface-variant">메모리 사용량:</span>
                <span class="md-typescale-body-medium font-mono text-md-sys-color-on-surface">{{ formatMemory(systemStatus.freemem) }} / {{ formatMemory(systemStatus.totalmem) }}</span>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-md-sys-color-outline-variant">
                <span class="md-typescale-body-medium font-medium text-md-sys-color-on-surface-variant">플랫폼:</span>
                <span class="md-typescale-body-medium font-mono text-md-sys-color-on-surface">{{ systemStatus.platform }}</span>
              </div>
              <div class="flex justify-between items-center py-2 border-b border-md-sys-color-outline-variant">
                <span class="md-typescale-body-medium font-medium text-md-sys-color-on-surface-variant">Node.js 버전:</span>
                <span class="md-typescale-body-medium font-mono text-md-sys-color-on-surface">{{ systemStatus.nodeVersion }}</span>
              </div>
              <div class="flex justify-between items-center py-2">
                <span class="md-typescale-body-medium font-medium text-md-sys-color-on-surface-variant">환경:</span>
                <span class="px-3 py-1 rounded-full text-sm"
                      [class]="systemStatus.environment === 'production' ? 'bg-md-sys-color-error-container text-md-sys-color-on-error-container' : 'bg-md-sys-color-primary-container text-md-sys-color-on-primary-container'">
                  {{ systemStatus.environment }}
                </span>
              </div>
              <div class="mt-4">
                <div class="flex justify-between items-center mb-2">
                  <span class="md-typescale-body-small text-md-sys-color-on-surface-variant">메모리 사용률</span>
                  <span class="md-typescale-body-small text-md-sys-color-on-surface-variant">{{ getMemoryUsagePercent().toFixed(1) }}%</span>
                </div>
                <div class="w-full bg-md-sys-color-surface-container-high rounded-full h-2">
                  <div class="bg-md-sys-color-primary h-2 rounded-full transition-all duration-300"
                       [style.width.%]="getMemoryUsagePercent()"></div>
                </div>
              </div>
							<div class="mt-4">
                <div class="flex justify-between items-center mb-2">
                  <span class="md-typescale-body-small text-md-sys-color-on-surface-variant">CPU 사용률</span>
                  <span class="md-typescale-body-small text-md-sys-color-on-surface-variant">{{ getCpuUsagePercent().toFixed(1) }}%</span>
                </div>
                <div class="w-full bg-md-sys-color-surface-container-high rounded-full h-2">
                  <div class="bg-md-sys-color-primary h-2 rounded-full transition-all duration-300"
                       [style.width.%]="getCpuUsagePercent()"></div>
                </div>
              </div>
            </div>
            <div *ngIf="!systemStatus" class="flex items-center justify-center h-48 text-md-sys-color-on-surface-variant">
              <div class="flex items-center gap-2">
                <mat-icon class="w-5 h-5 animate-spin">refresh</mat-icon>
                <span class="md-typescale-body-medium">시스템 정보를 불러오는 중...</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 사용자 통계 카드 -->
        <div class="md-card bg-md-sys-color-surface-container text-md-sys-color-on-surface hover:shadow-elevation-3 transition-all duration-300">
          <div class="flex items-center gap-3 mb-4">
            <mat-icon class="w-6 h-6 text-md-sys-color-primary">people</mat-icon>
            <h2 class="md-typescale-title-large text-md-sys-color-on-surface">사용자 통계</h2>
          </div>
          <div class="flex-1">
            <div *ngIf="userStats" class="space-y-6">
              <div class="grid grid-cols-2 gap-4">
                <div class="text-center p-4 bg-md-sys-color-primary-container rounded-xl">
                  <div class="text-3xl font-bold text-md-sys-color-on-primary-container mb-1">{{ userStats.totalUsers }}</div>
                  <div class="md-typescale-body-small text-md-sys-color-on-primary-container">총 사용자</div>
                </div>
                <div class="text-center p-4 bg-md-sys-color-secondary-container rounded-xl">
                  <div class="text-3xl font-bold text-md-sys-color-on-secondary-container mb-1">{{ userStats.activeUsers }}</div>
                  <div class="md-typescale-body-small text-md-sys-color-on-secondary-container">활성 사용자 (30일)</div>
                </div>
              </div>
              <div class="space-y-3">
                <h4 class="md-typescale-title-small text-md-sys-color-on-surface-variant mb-3">최근 가입자</h4>
                <div class="space-y-2">
                  <div *ngFor="let user of userStats.recentUsers.slice(0, 5)"
                       class="flex justify-between items-center py-2 px-3 bg-md-sys-color-surface-container-high rounded-lg">
                    <span class="md-typescale-body-medium font-medium text-md-sys-color-on-surface">{{ user.email }}</span>
                    <span class="md-typescale-body-small text-md-sys-color-on-surface-variant">{{ formatDate(user.created_at) }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div *ngIf="!userStats" class="flex items-center justify-center h-48 text-md-sys-color-on-surface-variant">
              <div class="flex items-center gap-2">
                <mat-icon class="w-5 h-5 animate-spin">refresh</mat-icon>
                <span class="md-typescale-body-medium">사용자 통계를 불러오는 중...</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 빠른 액션 카드 -->
        <div class="md-card bg-md-sys-color-surface-container text-md-sys-color-on-surface hover:shadow-elevation-3 transition-all duration-300">
          <div class="flex items-center gap-3 mb-4">
            <mat-icon class="w-6 h-6 text-md-sys-color-primary">flash_on</mat-icon>
            <h2 class="md-typescale-title-large text-md-sys-color-on-surface">빠른 액션</h2>
          </div>
          <div class="flex-1">
            <div class="space-y-3">
              <button class="w-full md-button md-button-tonal flex items-center justify-start gap-3 p-4 rounded-xl" (click)="navigateToLogs()">
                <mat-icon class="w-5 h-5 text-md-sys-color-on-secondary-container">article</mat-icon>
                <span class="md-typescale-label-large">로그 보기</span>
              </button>
              <button class="w-full md-button md-button-tonal flex items-center justify-start gap-3 p-4 rounded-xl" (click)="navigateToDatabase()">
                <mat-icon class="w-5 h-5 text-md-sys-color-on-secondary-container">storage</mat-icon>
                <span class="md-typescale-label-large">데이터베이스</span>
              </button>
              <button class="w-full md-button md-button-tonal flex items-center justify-start gap-3 p-4 rounded-xl" (click)="navigateToApiDocs()">
                <mat-icon class="w-5 h-5 text-md-sys-color-on-secondary-container">code</mat-icon>
                <span class="md-typescale-label-large">API 문서</span>
              </button>
              <button class="w-full md-button md-button-filled flex items-center justify-start gap-3 p-4 rounded-xl" (click)="refreshData()">
                <mat-icon class="w-5 h-5 text-md-sys-color-on-primary">refresh</mat-icon>
                <span class="md-typescale-label-large">새로고침</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }

    .md-card {
      min-height: 300px;
      display: flex;
      flex-direction: column;
    }

    .md-button {
      border: none;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s ease;
    }

    .md-button:hover {
      transform: translateY(-1px);
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
    return (this.systemStatus.freemem / this.systemStatus.totalmem) * 100;
  }

	getCpuUsagePercent(): number {
		if (!this.systemStatus || !this.systemStatus.loadavg) return 0;
		return this.systemStatus.loadavg * 100;
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
