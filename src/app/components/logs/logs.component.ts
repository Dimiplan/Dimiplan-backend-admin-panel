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
    <div class="logs-container">
      <h1>로그 관리</h1>

      <div class="logs-layout">
        <!-- 로그 파일 목록 -->
        <mat-card class="file-list-card">
          <mat-card-header>
            <mat-card-title>로그 파일 목록</mat-card-title>
            <button mat-icon-button (click)="refreshLogFiles()">
              <mat-icon>refresh</mat-icon>
            </button>
          </mat-card-header>
          <mat-card-content>
            <mat-list *ngIf="logFiles.length > 0">
              <mat-list-item 
                *ngFor="let file of logFiles" 
                [class.selected]="selectedFile?.name === file.name"
                (click)="selectLogFile(file)">
                <mat-icon matListItemIcon>article</mat-icon>
                <div matListItemTitle>{{ file.name }}</div>
                <div matListItemLine>
                  {{ formatFileSize(file.size) }} - {{ formatDate(file.modified) }}
                </div>
              </mat-list-item>
            </mat-list>
            <div *ngIf="logFiles.length === 0 && !loadingFiles" class="no-files">
              로그 파일이 없습니다.
            </div>
            <div *ngIf="loadingFiles" class="loading-center">
              <mat-spinner diameter="40"></mat-spinner>
              <p>로그 파일 목록을 불러오는 중...</p>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- 로그 내용 뷰어 -->
        <mat-card class="log-viewer-card">
          <mat-card-header>
            <mat-card-title>
              {{ selectedFile ? selectedFile.name : '로그 뷰어' }}
            </mat-card-title>
            <div class="viewer-controls" *ngIf="selectedFile">
              <mat-form-field appearance="outline" class="lines-input">
                <mat-label>표시할 라인 수</mat-label>
                <mat-select [(value)]="displayLines" (selectionChange)="loadLogContent()">
                  <mat-option [value]="50">최근 50줄</mat-option>
                  <mat-option [value]="100">최근 100줄</mat-option>
                  <mat-option [value]="200">최근 200줄</mat-option>
                  <mat-option [value]="500">최근 500줄</mat-option>
                  <mat-option [value]="0">전체</mat-option>
                </mat-select>
              </mat-form-field>
              <button mat-icon-button (click)="loadLogContent()" [disabled]="loadingContent">
                <mat-icon>refresh</mat-icon>
              </button>
              <button mat-icon-button (click)="downloadLog()" [disabled]="!logContent">
                <mat-icon>download</mat-icon>
              </button>
            </div>
          </mat-card-header>
          <mat-card-content>
            <div *ngIf="!selectedFile" class="no-selection">
              왼쪽에서 로그 파일을 선택해주세요.
            </div>
            
            <div *ngIf="selectedFile && !logContent && !loadingContent" class="no-content">
              로그 내용을 불러오려면 새로고침 버튼을 클릭하세요.
            </div>

            <div *ngIf="loadingContent" class="loading-center">
              <mat-spinner diameter="40"></mat-spinner>
              <p>로그 내용을 불러오는 중...</p>
            </div>

            <div *ngIf="logContent" class="log-content">
              <div class="log-info">
                <span>총 {{ logContent.totalLines }}줄 중 {{ logContent.displayedLines }}줄 표시</span>
                <div class="log-filters">
                  <button mat-button [class.active]="logFilter === 'all'" (click)="setLogFilter('all')">전체</button>
                  <button mat-button [class.active]="logFilter === 'error'" (click)="setLogFilter('error')">오류</button>
                  <button mat-button [class.active]="logFilter === 'warn'" (click)="setLogFilter('warn')">경고</button>
                  <button mat-button [class.active]="logFilter === 'info'" (click)="setLogFilter('info')">정보</button>
                </div>
              </div>
              <div class="log-text-container">
                <div *ngFor="let line of getFilteredLogLines(); let i = index" 
                     class="log-line" 
                     [ngClass]="getLogLineClass(line)">
                  <span class="log-line-number">{{ i + 1 }}</span>
                  <span class="log-timestamp">{{ extractTimestamp(line) }}</span>
                  <span class="log-level">{{ extractLogLevel(line) }}</span>
                  <span class="log-message">{{ extractMessage(line) }}</span>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .logs-container {
      padding: 20px;
      height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .logs-layout {
      display: grid;
      grid-template-columns: 400px 1fr;
      gap: 20px;
      flex: 1;
      min-height: 0;
    }

    .file-list-card, .log-viewer-card {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .file-list-card mat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .file-list-card mat-card-content {
      flex: 1;
      overflow-y: auto;
    }

    .log-viewer-card mat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .viewer-controls {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .lines-input {
      width: 150px;
    }

    .log-viewer-card mat-card-content {
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .log-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
    }

    .log-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      background-color: #f5f5f5;
      border-radius: 4px;
      margin-bottom: 12px;
      font-size: 0.9rem;
      color: rgba(0, 0, 0, 0.7);
    }

    .log-filters {
      display: flex;
      gap: 4px;
    }

    .log-filters button {
      padding: 4px 8px;
      font-size: 0.8rem;
      min-width: auto;
    }

    .log-filters button.active {
      background-color: #1976d2;
      color: white;
    }

    .log-text-container {
      flex: 1;
      background-color: #1e1e1e;
      border-radius: 4px;
      overflow: auto;
      max-height: 600px;
    }

    .log-line {
      display: flex;
      align-items: flex-start;
      padding: 2px 8px;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      line-height: 1.4;
      border-bottom: 1px solid #333;
    }

    .log-line:hover {
      background-color: #2a2a2a;
    }

    .log-line.error {
      background-color: rgba(244, 67, 54, 0.1);
      border-left: 3px solid #f44336;
    }

    .log-line.warn {
      background-color: rgba(255, 152, 0, 0.1);
      border-left: 3px solid #ff9800;
    }

    .log-line.info {
      background-color: rgba(76, 175, 80, 0.1);
      border-left: 3px solid #4caf50;
    }

    .log-line.verbose {
      background-color: rgba(33, 150, 243, 0.1);
      border-left: 3px solid #2196f3;
    }

    .log-line-number {
      width: 50px;
      color: #888;
      text-align: right;
      margin-right: 12px;
      user-select: none;
    }

    .log-timestamp {
      width: 140px;
      color: #bbb;
      margin-right: 12px;
    }

    .log-level {
      width: 60px;
      font-weight: bold;
      margin-right: 12px;
      text-transform: uppercase;
    }

    .log-level.error { color: #f44336; }
    .log-level.warn { color: #ff9800; }
    .log-level.info { color: #4caf50; }
    .log-level.verbose { color: #2196f3; }

    .log-message {
      flex: 1;
      color: #d4d4d4;
      word-break: break-word;
    }

    .selected {
      background-color: rgba(63, 81, 181, 0.1);
    }

    .no-files, .no-selection, .no-content {
      display: flex;
      align-items: center;
      justify-content: center;
      flex: 1;
      color: rgba(0, 0, 0, 0.5);
      font-style: italic;
    }

    .loading-center {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex: 1;
      gap: 16px;
    }

    .loading-center p {
      margin: 0;
      color: rgba(0, 0, 0, 0.5);
    }

    mat-list-item {
      cursor: pointer;
      border-radius: 4px;
      margin-bottom: 4px;
    }

    mat-list-item:hover {
      background-color: rgba(0, 0, 0, 0.04);
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
}