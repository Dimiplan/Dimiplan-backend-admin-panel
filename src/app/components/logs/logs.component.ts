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
  template: `
    <div class="p-6 bg-md-sys-color-surface min-h-screen">
      <h1 class="md-typescale-headline-large text-md-sys-color-on-surface mb-6">로그 관리</h1>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
        <!-- 로그 파일 목록 -->
        <div class="md-card bg-md-sys-color-surface-container text-md-sys-color-on-surface lg:col-span-1">
          <div class="flex items-center justify-between mb-4">
            <h2 class="md-typescale-title-large text-md-sys-color-on-surface">로그 파일 목록</h2>
            <button class="md-button md-button-text p-2 rounded-full" (click)="refreshLogFiles()">
              <mat-icon class="text-md-sys-color-primary">refresh</mat-icon>
            </button>
          </div>
          <div class="flex-1 overflow-y-auto">
            <div *ngIf="logFiles.length > 0" class="space-y-2">
              <div 
                *ngFor="let file of logFiles" 
                [class]="'flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ' + (selectedFile?.name === file.name ? 'bg-md-sys-color-secondary-container text-md-sys-color-on-secondary-container' : 'hover:bg-md-sys-color-surface-container-high')"
                (click)="selectLogFile(file)">
                <mat-icon class="min-w-[24px]" [class.text-md-sys-color-on-secondary-container]="selectedFile?.name === file.name">article</mat-icon>
                <div class="flex-1 overflow-hidden">
                  <div class="md-typescale-body-large font-medium truncate">{{ file.name }}</div>
                  <div class="md-typescale-body-small text-md-sys-color-on-surface-variant">
                    {{ formatFileSize(file.size) }} • {{ formatDate(file.modified) }}
                  </div>
                </div>
              </div>
            </div>
            <div *ngIf="logFiles.length === 0 && !loadingFiles" class="flex items-center justify-center h-48 text-md-sys-color-on-surface-variant">
              <div class="text-center">
                <mat-icon class="text-6xl mb-4 text-md-sys-color-outline">article</mat-icon>
                <p class="md-typescale-body-medium">로그 파일이 없습니다.</p>
              </div>
            </div>
            <div *ngIf="loadingFiles" class="flex flex-col items-center justify-center h-48 gap-4 text-md-sys-color-on-surface-variant">
              <mat-spinner diameter="40"></mat-spinner>
              <p class="md-typescale-body-medium">로그 파일 목록을 불러오는 중...</p>
            </div>
          </div>
        </div>

        <!-- 로그 내용 뷰어 -->
        <div class="md-card bg-md-sys-color-surface-container text-md-sys-color-on-surface lg:col-span-2">
          <div class="flex items-center justify-between mb-4">
            <h2 class="md-typescale-title-large text-md-sys-color-on-surface">
              {{ selectedFile ? selectedFile.name : '로그 뷰어' }}
            </h2>
            <div class="flex items-center gap-2" *ngIf="selectedFile">
              <select 
                [(ngModel)]="displayLines" 
                (change)="loadLogContent()"
                class="px-3 py-2 bg-md-sys-color-surface-container-highest text-md-sys-color-on-surface rounded-lg border border-md-sys-color-outline focus:border-md-sys-color-primary focus:outline-none">
                <option [value]="50">최근 50줄</option>
                <option [value]="100">최근 100줄</option>
                <option [value]="200">최근 200줄</option>
                <option [value]="500">최근 500줄</option>
                <option [value]="0">전체</option>
              </select>
              <button class="md-button md-button-text p-2 rounded-full" (click)="loadLogContent()" [disabled]="loadingContent">
                <mat-icon class="text-md-sys-color-primary">refresh</mat-icon>
              </button>
              <button class="md-button md-button-tonal px-4 py-2 rounded-full" (click)="downloadLog()" [disabled]="!logContent">
                <mat-icon class="mr-2">download</mat-icon>
                <span class="md-typescale-label-large">다운로드</span>
              </button>
            </div>
          </div>
          <div class="flex-1 overflow-hidden">
            <div *ngIf="!selectedFile" class="flex items-center justify-center h-full text-md-sys-color-on-surface-variant">
              <div class="text-center">
                <mat-icon class="text-6xl mb-4 text-md-sys-color-outline">visibility</mat-icon>
                <p class="md-typescale-body-large">왼쪽에서 로그 파일을 선택해주세요.</p>
              </div>
            </div>
            
            <div *ngIf="selectedFile && !logContent && !loadingContent" class="flex items-center justify-center h-full text-md-sys-color-on-surface-variant">
              <div class="text-center">
                <mat-icon class="text-6xl mb-4 text-md-sys-color-outline">refresh</mat-icon>
                <p class="md-typescale-body-large">로그 내용을 불러오려면 새로고침 버튼을 클릭하세요.</p>
              </div>
            </div>

            <div *ngIf="loadingContent" class="flex flex-col items-center justify-center h-full gap-4 text-md-sys-color-on-surface-variant">
              <mat-spinner diameter="40"></mat-spinner>
              <p class="md-typescale-body-medium">로그 내용을 불러오는 중...</p>
            </div>

            <div *ngIf="logContent" class="flex flex-col h-full">
              <div class="flex items-center justify-between p-3 bg-md-sys-color-surface-container-high rounded-xl mb-4">
                <span class="md-typescale-body-medium text-md-sys-color-on-surface">총 {{ logContent.totalLines }}줄 중 {{ logContent.displayedLines }}줄 표시</span>
                <div class="flex gap-1">
                  <button 
                    [class]="'px-3 py-1 text-xs rounded-full transition-all ' + (logFilter === 'all' ? 'bg-md-sys-color-primary text-md-sys-color-on-primary' : 'bg-md-sys-color-surface-container text-md-sys-color-on-surface hover:bg-md-sys-color-surface-container-high')"
                    (click)="setLogFilter('all')">전체</button>
                  <button 
                    [class]="'px-3 py-1 text-xs rounded-full transition-all ' + (logFilter === 'error' ? 'bg-md-sys-color-error text-md-sys-color-on-error' : 'bg-md-sys-color-surface-container text-md-sys-color-on-surface hover:bg-md-sys-color-surface-container-high')"
                    (click)="setLogFilter('error')">오류</button>
                  <button 
                    [class]="'px-3 py-1 text-xs rounded-full transition-all ' + (logFilter === 'warn' ? 'bg-md-sys-color-tertiary text-md-sys-color-on-tertiary' : 'bg-md-sys-color-surface-container text-md-sys-color-on-surface hover:bg-md-sys-color-surface-container-high')"
                    (click)="setLogFilter('warn')">경고</button>
                  <button 
                    [class]="'px-3 py-1 text-xs rounded-full transition-all ' + (logFilter === 'info' ? 'bg-md-sys-color-secondary text-md-sys-color-on-secondary' : 'bg-md-sys-color-surface-container text-md-sys-color-on-surface hover:bg-md-sys-color-surface-container-high')"
                    (click)="setLogFilter('info')">정보</button>
                </div>
              </div>
              <div class="flex-1 bg-gray-900 rounded-xl overflow-auto">
                <div *ngFor="let line of getFilteredLogLines(); let i = index" 
                     [class]="'flex items-start gap-3 p-2 font-mono text-sm border-b border-gray-800 hover:bg-gray-800 ' + getLogLineClass(line)">
                  <span class="w-12 text-gray-500 text-right select-none">{{ i + 1 }}</span>
                  <span class="w-36 text-gray-400 shrink-0">{{ extractTimestamp(line) }}</span>
                  <span [class]="'w-16 font-bold uppercase shrink-0 ' + getLogLevelColorClass(extractLogLevel(line))">{{ extractLogLevel(line) }}</span>
                  <span class="flex-1 text-gray-200 break-words">{{ extractMessage(line) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .md-card {
      padding: 24px;
      display: flex;
      flex-direction: column;
    }
    
    .md-button {
      border: none;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    
    .md-button:hover {
      transform: translateY(-1px);
    }
    
    .md-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }
    
    .error {
      border-left: 3px solid #ef4444;
      background-color: rgba(239, 68, 68, 0.1);
    }
    
    .warn {
      border-left: 3px solid #f59e0b;
      background-color: rgba(245, 158, 11, 0.1);
    }
    
    .info {
      border-left: 3px solid #10b981;
      background-color: rgba(16, 185, 129, 0.1);
    }
    
    .verbose {
      border-left: 3px solid #3b82f6;
      background-color: rgba(59, 130, 246, 0.1);
    }
  `]
})
export class LogsComponent implements OnInit {
  logFiles: LogFile[] = [];
  selectedFile: LogFile | null = null;
  logContent: LogContent | null = null;
  displayLines = 100;
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
    const lines = this.displayLines === 0 ? undefined : this.displayLines;
    
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