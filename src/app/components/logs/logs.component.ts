import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { AdminService, LogFile, LogContent } from '../../services/admin.service';

@Component({
    selector: 'app-logs',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatListModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatProgressSpinnerModule,
        FormsModule
    ],
	templateUrl: './logs.component.html'
})
export class LogsComponent implements OnInit {
    logFiles: LogFile[] = [];
    selectedFile: LogFile | null = null;
    logContent: LogContent | null = null;
    loadingFiles = false;
    loadingContent = false;
    logFilter = 'all';

    constructor(private adminService: AdminService) {}

    ngOnInit() {
        this.loadLogFiles();
    }

    loadLogFiles() {
        this.loadingFiles = true;
        this.adminService.getLogFiles().subscribe({
            next: (response) => {
                if (response.success) {
                    this.logFiles = response.data;
                }
                this.loadingFiles = false;
            },
            error: (error) => {
                console.error('로그 파일 목록 로드 실패:', error);
                this.loadingFiles = false;
            }
        });
    }

    selectLogFile(file: LogFile) {
        this.selectedFile = file;
        this.logContent = null;
        this.loadLogContent();
    }

    loadLogContent() {
        if (!this.selectedFile) return;

        this.loadingContent = true;
        const lines = this.logContent?.lines === 0 ? undefined : this.logContent?.lines;

        this.adminService.getLogContent(this.selectedFile.name, lines).subscribe({
            next: (response) => {
                if (response.success) {
                    this.logContent = response.data;
                }
                this.loadingContent = false;
            },
            error: (error) => {
                console.error('로그 내용 로드 실패:', error);
                this.loadingContent = false;
            }
        });
    }

    refreshLogFiles() {
        this.loadLogFiles();
    }

    downloadLog() {
        if (!this.logContent) return;

        const blob = new Blob([this.logContent.content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.logContent.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    formatDate(date: Date): string {
        return new Date(date).toLocaleString('ko-KR');
    }

    setLogFilter(filter: string) {
        this.logFilter = filter;
    }

    getFilteredLogLines(): string[] {
        if (!this.logContent) return [];

        const lines = this.logContent.content.split('\n').filter(line => line.trim());

        if (this.logFilter === 'all') {
            return lines;
        }

        return lines.filter(line => {
            const level = this.extractLogLevel(line).toLowerCase();
            return level === this.logFilter;
        });
    }

    extractTimestamp(line: string): string {
        const timestampMatch = line.match(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/);
        return timestampMatch ? timestampMatch[1] : '';
    }

    extractLogLevel(line: string): string {
        const levelMatch = line.match(/\s(error|warn|info|verbose):/i);
        return levelMatch ? levelMatch[1].toLowerCase() : '';
    }

    extractMessage(line: string): string {
        const messageMatch = line.match(/\s(?:error|warn|info|verbose):\s(.+)/i);
        return messageMatch ? messageMatch[1] : line;
    }

    getLogLineClass(line: string): string {
        const level = this.extractLogLevel(line);
        return level || '';
    }

    getLogLevelColorClass(level: string): string {
        switch (level.toLowerCase()) {
            case 'error': return 'text-red-400';
            case 'warn': return 'text-yellow-400';
            case 'info': return 'text-green-400';
            case 'verbose': return 'text-blue-400';
            default: return 'text-gray-400';
        }
    }
}
