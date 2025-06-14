import { AiUsage } from './../../services/admin.service';
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
        MatChipsModule,
    ],
	templateUrl: './dashboard.component.html',
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
            min-width: 280px;
            max-width: 100%;
        }

        @media (max-width: 768px) {
            .dashboard-container {
                overflow-x: hidden !important;
            }

            .grid {
                display: flex !important;
                flex-direction: column !important;
                overflow-x: visible !important;
            }

            .md-card {
                min-width: 100% !important;
                width: 100% !important;
            }
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
    aiUsage: AiUsage | null = null;

    constructor(private adminService: AdminService, private router: Router) {}

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
	loadAiUsage() {
		this.adminService.getAiUsage().subscribe({
			next: (response) => {
				if (response.success) {
					this.aiUsage = response.data;
				}
			},
			error: (error) => {
				console.error('AI 사용량 로드 실패:', error);
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

	round(value: number): number {
		return Math.round(value*100) / 100; // 소수점 둘째 자리까지 반올림
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
