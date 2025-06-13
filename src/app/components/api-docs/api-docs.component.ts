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
    <div class="p-6 bg-md-sys-color-surface min-h-screen max-w-6xl mx-auto">
      <h1 class="md-typescale-headline-large text-md-sys-color-on-surface mb-6">API 문서</h1>

      <div class="flex flex-col md:flex-row gap-4 mb-6">
        <div class="flex-1 max-w-md">
          <div class="relative">
            <input
              type="text"
              [(ngModel)]="searchTerm"
              (input)="filterApis()"
              placeholder="경로나 설명으로 검색..."
              class="w-full p-3 pr-12 bg-md-sys-color-surface-container-highest text-md-sys-color-on-surface rounded-xl border border-md-sys-color-outline focus:border-md-sys-color-primary focus:outline-none md-typescale-body-large">
            <mat-icon class="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-md-sys-color-on-surface-variant">search</mat-icon>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button class="md-button md-button-text p-2 rounded-full" (click)="refreshDocs()" [disabled]="loading" title="새로고침">
            <mat-icon class="w-5 h-5 text-md-sys-color-primary">refresh</mat-icon>
          </button>
          <button class="md-button md-button-text p-2 rounded-full" (click)="regenerateDocs()" [disabled]="loading" title="JSDoc 재생성">
            <mat-icon class="w-5 h-5 text-md-sys-color-primary">autorenew</mat-icon>
          </button>
          <button class="md-button md-button-filled px-4 py-2 rounded-full" (click)="exportDocs()" [disabled]="!apiDocs.length">
            <mat-icon class="w-5 h-5 mr-2">download</mat-icon>
            <span class="md-typescale-label-large">내보내기</span>
          </button>
        </div>
      </div>

      <div *ngIf="loading" class="flex flex-col items-center justify-center py-20 gap-4">
        <mat-spinner diameter="40"></mat-spinner>
        <p class="md-typescale-body-medium text-md-sys-color-on-surface-variant">API 문서를 불러오는 중...</p>
      </div>

      <div *ngIf="!loading && filteredDocs.length === 0 && apiDocs.length > 0" class="flex flex-col items-center justify-center py-20">
        <mat-icon class="w-16 h-16 mb-4 text-md-sys-color-outline">search_off</mat-icon>
        <p class="md-typescale-body-large text-md-sys-color-on-surface-variant">검색 결과가 없습니다.</p>
      </div>

      <div *ngIf="!loading && apiDocs.length === 0" class="flex flex-col items-center justify-center py-20">
        <mat-icon class="w-16 h-16 mb-4 text-md-sys-color-outline">api</mat-icon>
        <p class="md-typescale-body-large text-md-sys-color-on-surface-variant">API 문서를 찾을 수 없습니다.</p>
      </div>

      <div *ngIf="!loading && filteredDocs.length > 0">
        <div class="p-4 bg-md-sys-color-surface-container-high rounded-xl mb-6">
          <span class="md-typescale-body-medium text-md-sys-color-on-surface">총 {{ apiDocs.length }}개의 API 엔드포인트</span>
          <span *ngIf="searchTerm" class="md-typescale-body-medium text-md-sys-color-on-surface-variant ml-2">({{ filteredDocs.length }}개 필터링됨)</span>
        </div>

        <div class="space-y-4">
          <div *ngFor="let doc of filteredDocs; trackBy: trackByPath" class="md-card bg-md-sys-color-surface-container text-md-sys-color-on-surface">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3">
                <span class="px-3 py-1 rounded-full text-sm font-medium min-w-[60px] text-center"
                      [class]="getMethodColor(doc.method) === 'primary' ? 'bg-md-sys-color-primary text-md-sys-color-on-primary' :
                               getMethodColor(doc.method) === 'accent' ? 'bg-md-sys-color-secondary text-md-sys-color-on-secondary' :
                               getMethodColor(doc.method) === 'warn' ? 'bg-md-sys-color-error text-md-sys-color-on-error' :
                               'bg-md-sys-color-surface-container-high text-md-sys-color-on-surface'">
                  {{ doc.method }}
                </span>
                <span class="font-mono md-typescale-title-medium font-medium text-md-sys-color-on-surface">{{ doc.path }}</span>
              </div>
            </div>

            <p class="md-typescale-body-large text-md-sys-color-on-surface-variant mb-6">{{ doc.name }}</p>

            <div class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-md-sys-color-surface-container-high rounded-xl">
                <div class="flex items-center gap-2">
                  <span class="md-typescale-body-medium font-medium text-md-sys-color-on-surface-variant">파일:</span>
                  <span class="font-mono md-typescale-body-medium text-md-sys-color-on-surface">{{ doc.file }}.mjs</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="md-typescale-body-medium font-medium text-md-sys-color-on-surface-variant">메소드:</span>
                  <span class="px-2 py-1 rounded-full text-xs"
                        [class]="getMethodColor(doc.method) === 'primary' ? 'bg-md-sys-color-primary-container text-md-sys-color-on-primary-container' :
                                 getMethodColor(doc.method) === 'accent' ? 'bg-md-sys-color-secondary-container text-md-sys-color-on-secondary-container' :
                                 getMethodColor(doc.method) === 'warn' ? 'bg-md-sys-color-error-container text-md-sys-color-on-error-container' :
                                 'bg-md-sys-color-surface-container text-md-sys-color-on-surface'">
                    {{ doc.method }}
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="md-typescale-body-medium font-medium text-md-sys-color-on-surface-variant">경로:</span>
                  <code class="px-2 py-1 bg-md-sys-color-surface-container rounded text-sm font-mono text-md-sys-color-on-surface">{{ doc.path }}</code>
                </div>
              </div>

              <div *ngIf="doc.routeParams && doc.routeParams.length > 0" class="space-y-2">
                <h4 class="md-typescale-title-small text-md-sys-color-on-surface flex items-center gap-2">
                  <mat-icon class="w-5 h-5 text-md-sys-color-primary">route</mat-icon>
                  경로 파라미터
                </h4>
                <div class="space-y-3">
                  <div *ngFor="let routeParam of doc.routeParams" class="p-3 bg-md-sys-color-primary-container rounded-lg">
                    <div class="flex items-start justify-between mb-2">
                      <div class="flex items-center gap-2">
                        <code class="px-2 py-1 bg-md-sys-color-surface-container rounded text-sm font-mono text-md-sys-color-on-surface">:{{ routeParam.name }}</code>
                        <span class="px-2 py-1 rounded-full text-xs bg-md-sys-color-error-container text-md-sys-color-on-error-container">필수</span>
                      </div>
                      <span class="text-sm font-mono text-md-sys-color-on-primary-container">{{ routeParam.type }}</span>
                    </div>
                    <p class="md-typescale-body-small text-md-sys-color-on-primary-container">{{ routeParam.description }}</p>
                  </div>
                </div>
              </div>

              <div *ngIf="doc.params && doc.params.length > 0" class="space-y-2">
                <h4 class="md-typescale-title-small text-md-sys-color-on-surface flex items-center gap-2">
                  <mat-icon class="w-5 h-5 text-md-sys-color-primary">settings</mat-icon>
                  {{ doc.method.toUpperCase() === 'GET' ? '쿼리 파라미터' : '요청 본문' }}
                </h4>
                <div class="space-y-3">
                  <div *ngFor="let param of doc.params" class="p-3 bg-md-sys-color-surface-container-high rounded-lg">
                    <div class="flex items-start justify-between mb-2">
                      <div class="flex items-center gap-2">
                        <code class="px-2 py-1 bg-md-sys-color-surface-container rounded text-sm font-mono text-md-sys-color-on-surface">{{ param.name }}</code>
                        <span class="px-2 py-1 rounded-full text-xs"
                              [class]="param.required ? 'bg-md-sys-color-error-container text-md-sys-color-on-error-container' : 'bg-md-sys-color-surface-container text-md-sys-color-on-surface'">{{ param.required ? '필수' : '선택' }}</span>
                      </div>
                      <span class="text-sm font-mono text-md-sys-color-on-surface-variant">{{ param.type }}</span>
                    </div>
                    <p class="md-typescale-body-small text-md-sys-color-on-surface-variant">{{ param.description }}</p>
                  </div>
                </div>
              </div>

              <div *ngIf="doc.returns" class="space-y-2">
                <h4 class="md-typescale-title-small text-md-sys-color-on-surface flex items-center gap-2">
                  <mat-icon class="w-5 h-5 text-md-sys-color-primary">keyboard_return</mat-icon>
                  반환값
                </h4>
                <p class="md-typescale-body-medium text-md-sys-color-on-surface leading-relaxed">{{ doc.returns.type }} - {{ doc.returns.description }}</p>
              </div>

              <div class="space-y-2">
                <h4 class="md-typescale-title-small text-md-sys-color-on-surface flex items-center gap-2">
                  <mat-icon class="w-5 h-5 text-md-sys-color-primary">code</mat-icon>
                  사용 예시
                </h4>
                <div class="relative bg-gray-900 text-gray-100 rounded-xl overflow-hidden">
                  <pre class="p-4 overflow-x-auto font-mono text-sm leading-relaxed"><code>{{ generateCurlExample(doc) }}</code></pre>
                  <button class="absolute top-3 right-3 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                          (click)="copyCurl(doc)"
                          title="클립보드에 복사">
                    <mat-icon class="w-5 h-5 text-gray-300">content_copy</mat-icon>
                  </button>
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
      border-radius: 16px;
      transition: all 0.3s ease;
    }

    .md-card:hover {
      transform: translateY(-2px);
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

    input:focus {
      box-shadow: 0 0 0 2px var(--md-sys-color-primary);
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
      doc.name.toLowerCase().includes(term) ||
      doc.method.toLowerCase().includes(term) ||
      doc.file.toLowerCase().includes(term) ||
      (doc.params && doc.params.some(param =>
        param.name.toLowerCase().includes(term) ||
        param.description.toLowerCase().includes(term)
      )) ||
      (doc.routeParams && doc.routeParams.some(routeParam =>
        routeParam.name.toLowerCase().includes(term) ||
        routeParam.description.toLowerCase().includes(term)
      ))
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
    let url = `${baseUrl}${doc.path}`;

    // Replace route parameters with example values
    if (doc.routeParams && doc.routeParams.length > 0) {
      doc.routeParams.forEach(routeParam => {
        const exampleValue = routeParam.type === 'string' ? 'example' : routeParam.type === 'number' ? '123' : 'value';
        url = url.replace(`:${routeParam.name}`, exampleValue);
      });
    }

    switch (doc.method.toUpperCase()) {
      case 'GET':
        if (doc.params && doc.params.length > 0) {
          const queryParams = doc.params.map(param => `${param.name}=${param.type === 'string' ? 'value' : param.type === 'number' ? '1' : 'true'}`).join('&');
          url += `?${queryParams}`;
        }
        return `curl -X GET "${url}" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN"`;

      case 'POST':
        let postBody = '{\n';
        if (doc.params && doc.params.length > 0) {
          const bodyParams = doc.params.map(param => {
            const value = param.type === 'string' ? '"value"' : param.type === 'number' ? '1' : 'true';
            return `    "${param.name}": ${value}`;
          }).join(',\n');
          postBody += bodyParams + '\n';
        } else {
          postBody += '    "key": "value"\n';
        }
        postBody += '  }';
        return `curl -X POST "${url}" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -d '${postBody}'`;

      case 'PUT':
        let putBody = '{\n';
        if (doc.params && doc.params.length > 0) {
          const bodyParams = doc.params.map(param => {
            const value = param.type === 'string' ? '"value"' : param.type === 'number' ? '1' : 'true';
            return `    "${param.name}": ${value}`;
          }).join(',\n');
          putBody += bodyParams + '\n';
        } else {
          putBody += '    "key": "value"\n';
        }
        putBody += '  }';
        return `curl -X PUT "${url}" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -d '${putBody}'`;

      case 'DELETE':
        if (doc.params && doc.params.length > 0) {
          const queryParams = doc.params.map(param => `${param.name}=${param.type === 'string' ? 'value' : param.type === 'number' ? '1' : 'true'}`).join('&');
          url += `?${queryParams}`;
        }
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
        if (doc.name) {
          markdown += `**요약:** ${doc.name}\n\n`;
        }
        if (doc.routeParams && doc.routeParams.length > 0) {
          markdown += `**경로 파라미터:**\n\n`;
          for (const routeParam of doc.routeParams) {
            markdown += `- \`:${routeParam.name}\` (${routeParam.type}) **필수**: ${routeParam.description}\n`;
          }
          markdown += '\n';
        }
        if (doc.params && doc.params.length > 0) {
          markdown += `**${doc.method.toUpperCase() === 'GET' ? '쿼리 파라미터' : '요청 본문'}:**\n\n`;
          for (const param of doc.params) {
            markdown += `- \`${param.name}\` (${param.type}) ${param.required ? '**필수**' : '*선택*'}: ${param.description}\n`;
          }
          markdown += '\n';
        }
        if (doc.returns) {
          markdown += `**반환값:** ${doc.returns.type} - ${doc.returns.description}\n\n`;
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

  trackByPath(_: number, doc: ApiDoc): string {
    return `${doc.method}-${doc.path}`;
  }
}
