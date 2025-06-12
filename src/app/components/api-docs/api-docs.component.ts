import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { AdminService, ApiDoc } from '../../services/admin.service';

@Component({
  selector: 'app-api-docs',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    FormsModule
  ],
  template: `
    <div class="api-docs-container">
      <h1>API 문서</h1>

      <div class="api-docs-header">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>API 검색</mat-label>
          <input matInput [(ngModel)]="searchTerm" (input)="filterApis()" placeholder="경로나 설명으로 검색...">
          <mat-icon matSuffix>search</mat-icon>
        </mat-form-field>

        <div class="header-actions">
          <button mat-icon-button (click)="refreshDocs()" [disabled]="loading" matTooltip="새로고침">
            <mat-icon>refresh</mat-icon>
          </button>
          <button mat-icon-button (click)="regenerateDocs()" [disabled]="loading" matTooltip="JSDoc 재생성">
            <mat-icon>autorenew</mat-icon>
          </button>
          <button mat-raised-button color="primary" (click)="exportDocs()" [disabled]="!apiDocs.length">
            <mat-icon>download</mat-icon>
            내보내기
          </button>
        </div>
      </div>

      <div *ngIf="loading" class="loading-center">
        <mat-spinner diameter="40"></mat-spinner>
        <p>API 문서를 불러오는 중...</p>
      </div>

      <div *ngIf="!loading && filteredDocs.length === 0 && apiDocs.length > 0" class="no-results">
        검색 결과가 없습니다.
      </div>

      <div *ngIf="!loading && apiDocs.length === 0" class="no-docs">
        API 문서를 찾을 수 없습니다.
      </div>

      <div *ngIf="!loading && filteredDocs.length > 0" class="api-docs-content">
        <div class="stats-bar">
          <span>총 {{ apiDocs.length }}개의 API 엔드포인트</span>
          <span *ngIf="searchTerm">({{ filteredDocs.length }}개 필터링됨)</span>
        </div>

        <mat-accordion multi="true">
          <mat-expansion-panel *ngFor="let doc of filteredDocs; trackBy: trackByPath" class="api-panel">
            <mat-expansion-panel-header>
              <mat-panel-title>
                <div class="panel-title">
                  <mat-chip [color]="getMethodColor(doc.method)" class="method-chip">
                    {{ doc.method }}
                  </mat-chip>
                  <span class="api-path">{{ doc.path }}</span>
                </div>
              </mat-panel-title>
              <mat-panel-description>
                {{ doc.brief }}
              </mat-panel-description>
            </mat-expansion-panel-header>

            <div class="api-details">
              <div class="detail-section">
                <h4>
                  <mat-icon>info</mat-icon>
                  기본 정보
                </h4>
                <div class="info-grid">
                  <div class="info-item">
                    <span class="label">파일:</span>
                    <span class="value">{{ doc.file }}.mjs</span>
                  </div>
                  <div class="info-item">
                    <span class="label">메소드:</span>
                    <mat-chip [color]="getMethodColor(doc.method)">{{ doc.method }}</mat-chip>
                  </div>
                  <div class="info-item">
                    <span class="label">경로:</span>
                    <code class="path-code">{{ doc.path }}</code>
                  </div>
                </div>
              </div>

              <div class="detail-section" *ngIf="doc.brief">
                <h4>
                  <mat-icon>short_text</mat-icon>
                  요약
                </h4>
                <p class="brief-text">{{ doc.brief }}</p>
              </div>

              <div class="detail-section" *ngIf="doc.details">
                <h4>
                  <mat-icon>description</mat-icon>
                  상세 설명
                </h4>
                <p class="details-text">{{ doc.details }}</p>
              </div>

              <div class="detail-section" *ngIf="doc.returns">
                <h4>
                  <mat-icon>keyboard_return</mat-icon>
                  반환값
                </h4>
                <p class="returns-text">{{ doc.returns }}</p>
              </div>

              <div class="detail-section">
                <h4>
                  <mat-icon>code</mat-icon>
                  사용 예시
                </h4>
                <div class="code-example">
                  <pre><code>{{ generateCurlExample(doc) }}</code></pre>
                  <button mat-icon-button (click)="copyCurl(doc)" matTooltip="클립보드에 복사">
                    <mat-icon>content_copy</mat-icon>
                  </button>
                </div>
              </div>
            </div>
          </mat-expansion-panel>
        </mat-accordion>
      </div>
    </div>
  `,
  styles: [`
    .api-docs-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .api-docs-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      gap: 16px;
    }

    .search-field {
      flex: 1;
      max-width: 400px;
    }

    .header-actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .stats-bar {
      padding: 12px 16px;
      background-color: #f5f5f5;
      border-radius: 4px;
      margin-bottom: 16px;
      font-size: 0.9rem;
      color: rgba(0, 0, 0, 0.7);
    }

    .loading-center, .no-results, .no-docs {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      color: rgba(0, 0, 0, 0.5);
    }

    .loading-center {
      gap: 16px;
    }

    .api-panel {
      margin-bottom: 8px;
    }

    .panel-title {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
    }

    .method-chip {
      min-width: 60px;
      text-align: center;
      font-weight: 500;
    }

    .api-path {
      font-family: 'Courier New', monospace;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.87);
    }

    .api-details {
      padding: 16px 0;
    }

    .detail-section {
      margin-bottom: 24px;
    }

    .detail-section:last-child {
      margin-bottom: 0;
    }

    .detail-section h4 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 12px 0;
      color: rgba(0, 0, 0, 0.87);
      font-size: 1rem;
      font-weight: 500;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 12px;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .info-item .label {
      font-weight: 500;
      color: rgba(0, 0, 0, 0.7);
      min-width: 60px;
    }

    .info-item .value {
      font-family: monospace;
    }

    .path-code {
      background-color: #f5f5f5;
      padding: 4px 8px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
    }

    .brief-text, .details-text, .returns-text {
      margin: 0;
      line-height: 1.5;
      color: rgba(0, 0, 0, 0.87);
    }

    .code-example {
      position: relative;
      background-color: #1e1e1e;
      color: #d4d4d4;
      border-radius: 4px;
      overflow: hidden;
    }

    .code-example pre {
      margin: 0;
      padding: 16px;
      overflow-x: auto;
      font-family: 'Courier New', monospace;
      font-size: 13px;
      line-height: 1.4;
    }

    .code-example button {
      position: absolute;
      top: 8px;
      right: 8px;
      background-color: rgba(255, 255, 255, 0.1);
      color: #d4d4d4;
    }

    .code-example button:hover {
      background-color: rgba(255, 255, 255, 0.2);
    }

    mat-accordion {
      display: block;
    }
  `]
})
export class ApiDocsComponent implements OnInit {
  apiDocs: ApiDoc[] = [];
  filteredDocs: ApiDoc[] = [];
  searchTerm = '';
  loading = false;

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadApiDocs();
  }

  loadApiDocs() {
    this.loading = true;
    this.adminService.getApiDocs().subscribe({
      next: (response) => {
        if (response.success) {
          this.apiDocs = response.data.sort((a, b) => {
            if (a.file !== b.file) {
              return a.file.localeCompare(b.file);
            }
            return a.path.localeCompare(b.path);
          });
          this.filteredDocs = [...this.apiDocs];
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('API 문서 로드 실패:', error);
        this.loading = false;
      }
    });
  }

  filterApis() {
    if (!this.searchTerm.trim()) {
      this.filteredDocs = [...this.apiDocs];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredDocs = this.apiDocs.filter(doc =>
      doc.path.toLowerCase().includes(term) ||
      doc.brief.toLowerCase().includes(term) ||
      doc.details.toLowerCase().includes(term) ||
      doc.method.toLowerCase().includes(term) ||
      doc.file.toLowerCase().includes(term)
    );
  }

  refreshDocs() {
    this.loadApiDocs();
  }

  regenerateDocs() {
    this.loading = true;
    this.adminService.regenerateApiDocs().subscribe({
      next: (response) => {
        if (response.success) {
          console.log('JSDoc 재생성 성공:', response.message);
          // 재생성 후 문서 다시 로드
          this.loadApiDocs();
        } else {
          console.error('JSDoc 재생성 실패');
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('JSDoc 재생성 실패:', error);
        this.loading = false;
      }
    });
  }

  getMethodColor(method: string): 'primary' | 'accent' | 'warn' | undefined {
    switch (method.toUpperCase()) {
      case 'GET': return 'primary';
      case 'POST': return 'accent';
      case 'PUT': return 'warn';
      case 'DELETE': return 'warn';
      default: return undefined;
    }
  }

  generateCurlExample(doc: ApiDoc): string {
    const baseUrl = 'https://api-dev.dimiplan.com';
    const url = `${baseUrl}${doc.path}`;

    switch (doc.method.toUpperCase()) {
      case 'GET':
        return `curl -X GET "${url}" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN"`;

      case 'POST':
        return `curl -X POST "${url}" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -d '{
    "key": "value"
  }'`;

      case 'PUT':
        return `curl -X PUT "${url}" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -d '{
    "key": "value"
  }'`;

      case 'DELETE':
        return `curl -X DELETE "${url}" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN"`;

      default:
        return `curl -X ${doc.method} "${url}" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN"`;
    }
  }

  copyCurl(doc: ApiDoc) {
    const curlCommand = this.generateCurlExample(doc);
    navigator.clipboard.writeText(curlCommand).then(() => {
      console.log('cURL 명령어가 클립보드에 복사되었습니다.');
    }).catch(err => {
      console.error('클립보드 복사 실패:', err);
    });
  }

  exportDocs() {
    const docsContent = this.generateMarkdownDocs();
    const blob = new Blob([docsContent], { type: 'text/markdown;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'api-documentation.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  private generateMarkdownDocs(): string {
    let markdown = '# API 문서\n\n';
    markdown += `생성일: ${new Date().toLocaleString('ko-KR')}\n\n`;

    const groupedDocs = this.apiDocs.reduce((groups, doc) => {
      const group = groups[doc.file] || [];
      group.push(doc);
      groups[doc.file] = group;
      return groups;
    }, {} as Record<string, ApiDoc[]>);

    for (const [file, docs] of Object.entries(groupedDocs)) {
      markdown += `## ${file}\n\n`;

      for (const doc of docs) {
        markdown += `### ${doc.method} ${doc.path}\n\n`;
        if (doc.brief) {
          markdown += `**요약:** ${doc.brief}\n\n`;
        }
        if (doc.details) {
          markdown += `**설명:** ${doc.details}\n\n`;
        }
        if (doc.returns) {
          markdown += `**반환값:** ${doc.returns}\n\n`;
        }
        markdown += '**사용 예시:**\n\n';
        markdown += '```bash\n';
        markdown += this.generateCurlExample(doc);
        markdown += '\n```\n\n';
        markdown += '---\n\n';
      }
    }

    return markdown;
  }

  trackByPath(index: number, doc: ApiDoc): string {
    return `${doc.method}-${doc.path}`;
  }
}
