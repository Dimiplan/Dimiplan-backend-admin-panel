import { CommonModule } from '@angular/common';
import { Component, inject, type OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router } from '@angular/router';
import type { AiUsage } from './../../services/admin.service';
import {
  AdminService,
  type SystemStatus,
  type UserStats,
} from '../../services/admin.service';

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
    MatChipsModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private adminService = inject(AdminService);
  private router = inject(Router);

  systemStatus: SystemStatus | null = null;
  userStats: UserStats | null = null;
  aiUsage: AiUsage | null = null;

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loadSystemStatus();
    this.loadAiUsage();
    this.loadUserStats();
  }

  loadSystemStatus() {
    this.adminService.getSystemStatus().subscribe({
      next: response => {
        if (response.success) {
          this.systemStatus = response.data;
        }
      },
      error: error => {
        console.error('시스템 상태 로드 실패:', error);
      },
    });
  }
  loadAiUsage() {
    this.adminService.getAiUsage().subscribe({
      next: response => {
        if (response.success) {
          this.aiUsage = response.data;
        }
      },
      error: error => {
        console.error('AI 사용량 로드 실패:', error);
      },
    });
  }

  loadUserStats() {
    this.adminService.getUserStats().subscribe({
      next: response => {
        if (response.success) {
          this.userStats = response.data;
        }
      },
      error: error => {
        console.error('사용자 통계 로드 실패:', error);
      },
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

  round(value: number): number {
    return Math.round(value * 100) / 100; // 소수점 둘째 자리까지 반올림
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
