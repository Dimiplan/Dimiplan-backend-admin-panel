import { CommonModule } from '@angular/common';
import { Component, inject, type OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  AdminService,
  type LogContent,
  type LogFile,
} from '../../services/admin.service';

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
    FormsModule,
  ],
  templateUrl: './logs.component.html',
})
export class LogsComponent implements OnInit {
  private adminService = inject(AdminService);
  private snackBar = inject(MatSnackBar);

  logFiles: LogFile[] = [];
  selectedFile: LogFile | null = null;
  logContent: LogContent | null = null;
  loadingFiles = false;
  loadingContent = false;
  logFilter = 'all';

  ngOnInit() {
    this.loadLogFiles();
  }

  loadLogFiles() {
    this.loadingFiles = true;
    this.adminService.getLogFiles().subscribe({
      next: response => {
        if (response.success) {
          this.logFiles = response.data;
        }
        this.loadingFiles = false;
      },
      error: error => {
        console.error('로그 파일 목록 로드 실패:', error);
        this.loadingFiles = false;
      },
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
    const lines =
      this.logContent?.lines === 0 ? undefined : this.logContent?.lines;

    this.adminService.getLogContent(this.selectedFile.name, lines).subscribe({
      next: response => {
        if (response.success) {
          this.logContent = response.data;
        }
        this.loadingContent = false;
      },
      error: error => {
        console.error('로그 내용 로드 실패:', error);
        this.loadingContent = false;
      },
    });
  }

  downloadLog() {
    if (!this.logContent) return;

    const blob = new Blob([this.logContent.content], {
      type: 'text/plain',
    });
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
    return `${parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleString('ko-KR');
  }

  setLogFilter(filter: string) {
    this.logFilter = filter;
  }

  getFilteredLogLines(): string[] {
    if (!this.logContent) return [];

    const lines = this.logContent.content
      .split('\n')
      .filter(line => line.trim());

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
      case 'error':
        return 'text-red-400';
      case 'warn':
        return 'text-yellow-400';
      case 'info':
        return 'text-green-400';
      case 'verbose':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  }

  confirmDeleteLogFile(file: LogFile) {
    if (confirm(`정말 "${file.name}" 로그 파일을 삭제하시겠습니까?`)) {
      this.deleteLogFile(file);
    }
  }

  confirmClearAllLogs() {
    if (
      confirm(
        '정말 모든 로그 파일을 비우시겠습니까? 이 작업은 되돌릴 수 없습니다.'
      )
    ) {
      this.clearAllLogs();
    }
  }

  private deleteLogFile(file: LogFile) {
    this.adminService.deleteLogFile(file.name).subscribe({
      next: response => {
        if (response.success) {
          this.snackBar.open('로그 파일이 삭제되었습니다', '닫기', {
            duration: 3000,
          });
          this.loadLogFiles();
          // 삭제된 파일이 현재 선택된 파일이면 선택 해제
          if (this.selectedFile?.name === file.name) {
            this.selectedFile = null;
            this.logContent = null;
          }
        }
      },
      error: error => {
        console.error('로그 파일 삭제 실패:', error);
        this.snackBar.open('로그 파일 삭제에 실패했습니다', '닫기', {
          duration: 3000,
        });
      },
    });
  }

  private clearAllLogs() {
    this.adminService.clearAllLogs().subscribe({
      next: response => {
        if (response.success) {
          this.snackBar.open(
            `${response.data.clearedFiles}개의 로그 파일이 비워졌습니다`,
            '닫기',
            {
              duration: 3000,
            }
          );
          this.loadLogFiles();
          // 현재 선택된 파일의 내용도 새로 로드
          if (this.selectedFile) {
            this.logContent = null;
            this.loadLogContent();
          }
        }
      },
      error: error => {
        console.error('로그 파일 비우기 실패:', error);
        this.snackBar.open('로그 파일 비우기에 실패했습니다', '닫기', {
          duration: 3000,
        });
      },
    });
  }
}
