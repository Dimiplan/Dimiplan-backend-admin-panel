import { CommonModule } from '@angular/common';
import { Component, inject, type OnDestroy, type OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import sanitizeHtml from 'sanitize-html';
import { AdminService, type ApiDoc } from '../../services/admin.service';
import { baseUrl } from '../../services/base-url';

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
    MatSelectModule,
    FormsModule,
  ],
  templateUrl: './api-docs.component.html',
  styleUrl: './api-docs.component.scss',
})
export class ApiDocsComponent implements OnInit, OnDestroy {
  private adminService = inject(AdminService);

  apiDocs: ApiDoc[] = [];
  filteredDocs: ApiDoc[] = [];
  searchTerm = '';
  selectedFile = '';
  loading = false;
  showFileDropdown = false;
  copiedDocId: string | null = null;

  ngOnInit() {
    this.loadApiDocs();
    // 드롭다운 외부 클릭 시 닫기
    document.addEventListener('click', this.handleOutsideClick);
  }

  ngOnDestroy() {
    document.removeEventListener('click', this.handleOutsideClick);
  }

  private handleOutsideClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative') && this.showFileDropdown) {
      this.showFileDropdown = false;
    }
  };

  toggleFileDropdown() {
    this.showFileDropdown = !this.showFileDropdown;
  }

  selectFile(file: string) {
    this.selectedFile = file;
    this.showFileDropdown = false;
    this.filterApis();
  }

  getUniqueFiles(): string[] {
    const files = [...new Set(this.apiDocs.map(doc => doc.file))];
    return files.sort();
  }

  loadApiDocs() {
    this.loading = true;
    this.adminService.getApiDocs().subscribe({
      next: response => {
        if (response.success) {
          this.apiDocs = response.data.sort((a, b) => {
            if (a.file !== b.file) {
              return a.file.localeCompare(b.file);
            }
            return a.path.localeCompare(b.path);
          });
          this.filterApis();
        }
        this.loading = false;
      },
      error: error => {
        console.error('API 문서 로드 실패:', error);
        this.loading = false;
      },
    });
  }

  filterApis() {
    let filtered = [...this.apiDocs];

    // File filter
    if (this.selectedFile) {
      filtered = filtered.filter(doc => doc.file === this.selectedFile);
    }

    // Search term filter
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        doc =>
          doc.path.toLowerCase().includes(term) ||
          doc.name.toLowerCase().includes(term) ||
          doc.method.toLowerCase().includes(term) ||
          doc.file.toLowerCase().includes(term) ||
          doc.params?.some(
            param =>
              param.name.toLowerCase().includes(term) ||
              param.description.toLowerCase().includes(term)
          ) ||
          doc.routeParams?.some(
            routeParam =>
              routeParam.name.toLowerCase().includes(term) ||
              routeParam.description.toLowerCase().includes(term)
          )
      );
    }

    this.filteredDocs = filtered;
  }

  refreshDocs() {
    this.loadApiDocs();
  }

  regenerateDocs() {
    this.loading = true;
    this.adminService.regenerateApiDocs().subscribe({
      next: response => {
        if (response.success) {
          console.log('JSDoc 재생성 성공:', response.message);
          // 재생성 후 문서 다시 로드
          this.loadApiDocs();
        } else {
          console.error('JSDoc 재생성 실패');
          this.loading = false;
        }
      },
      error: error => {
        console.error('JSDoc 재생성 실패:', error);
        this.loading = false;
      },
    });
  }

  getMethodColor(method: string): 'primary' | 'accent' | 'warn' | undefined {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'primary';
      case 'POST':
        return 'accent';
      case 'PUT':
        return 'warn';
      case 'DELETE':
        return 'warn';
      default:
        return undefined;
    }
  }

  generateCurlExample(doc: ApiDoc): string {
    let url = `${baseUrl.replace('/admin', '')}${doc.path}`;

    // Replace route parameters with example values
    if (doc.routeParams && doc.routeParams.length > 0) {
      doc.routeParams.forEach(routeParam => {
        const exampleValue =
          routeParam.type === 'string'
            ? 'example'
            : routeParam.type === 'number'
              ? '123'
              : 'value';
        url = url.replace(`:${routeParam.name}`, exampleValue);
      });
    }

    switch (doc.method.toUpperCase()) {
      case 'GET': {
        if (doc.params && doc.params.length > 0) {
          const queryParams = doc.params
            .map(
              param =>
                `${param.name}=${param.type === 'string' ? 'value' : param.type === 'number' ? '1' : 'true'}`
            )
            .join('&');
          url += `?${queryParams}`;
        }
        return `curl -X GET "${url}" \\
                    -H "Content-Type: application/json" \\
                    -H "Authorization: Bearer YOUR_TOKEN"`;
      }

      case 'POST': {
        let postBody = '{\n';
        if (doc.params && doc.params.length > 0) {
          const bodyParams = doc.params
            .map(param => {
              const value =
                param.type === 'string'
                  ? '"value"'
                  : param.type === 'number'
                    ? '1'
                    : 'true';
              return `  "${param.name}": ${value}`;
            })
            .join(',\n');
          postBody += `${bodyParams}\n`;
        } else {
          postBody += '  "key": "value"\n';
        }
        postBody += '  }';
        return `curl -X POST "${url}" \\
                    -H "Content-Type: application/json" \\
                    -H "Authorization: Bearer YOUR_TOKEN" \\
                    -d '${postBody}'`;
      }

      case 'PUT': {
        let putBody = '{\n';
        if (doc.params && doc.params.length > 0) {
          const bodyParams = doc.params
            .map(param => {
              const value =
                param.type === 'string'
                  ? '"value"'
                  : param.type === 'number'
                    ? '1'
                    : 'true';
              return `    ${param.name}": ${value}`;
            })
            .join(',\n');
          putBody += `${bodyParams}\n`;
        } else {
          putBody += '    "key": "value"\n';
        }
        putBody += '  }';
        return `curl -X PUT "${url}" \\
                    -H "Content-Type: application/json" \\
                    -H "Authorization: Bearer YOUR_TOKEN" \\
                    -d '${putBody}'`;
      }

      case 'DELETE': {
        if (doc.params && doc.params.length > 0) {
          const queryParams = doc.params
            .map(
              param =>
                `${param.name}=${param.type === 'string' ? 'value' : param.type === 'number' ? '1' : 'true'}`
            )
            .join('&');
          url += `?${queryParams}`;
        }
        return `curl -X DELETE "${url}" \\
                    -H "Content-Type: application/json" \\
                    -H "Authorization: Bearer YOUR_TOKEN"`;
      }

      default:
        return `curl -X ${doc.method} "${url}" \\
                -H "Content-Type: application/json" \\
                -H "Authorization: Bearer YOUR_TOKEN"`;
    }
  }

  copyCurl(doc: ApiDoc) {
    const curlCommand = this.generateCurlExample(doc);
    navigator.clipboard
      .writeText(curlCommand)
      .then(() => {
        this.copiedDocId = `${doc.method}-${doc.path}`;
        setTimeout(() => {
          this.copiedDocId = null;
        }, 2000);
      })
      .catch(err => {
        console.error('클립보드 복사 실패:', err);
      });
  }

  exportDocs() {
    const docsContent = this.generateMarkdownDocs();
    const blob = new Blob([docsContent], {
      type: 'text/markdown;charset=utf-8;',
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'api-documentation.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  trackByPath(doc: ApiDoc): string {
    return doc.path + doc.method;
  }

  getReturnsByGroup(
    returns: Array<{ type: { names: string[] }; description: string }>,
    groupKey: string
  ) {
    const groups = this.groupReturns(returns);
    if (groups[groupKey]) {
      return groups[groupKey];
    }
    return [];
  }

  getGroupedReturnsWithoutRoot(
    returns: Array<{ type: { names: string[] }; description: string }>
  ) {
    const groups = this.groupReturns(returns);
    const result: Record<
      string,
      Array<{
        type: { names: string[] };
        description: string;
        fullName: string;
        propertyName: string;
      }>
    > = {};

    for (const [key, value] of Object.entries(groups)) {
      if (key !== 'root') {
        result[key] = value;
      }
    }

    return result;
  }

  groupReturns(
    returns: Array<{ type: { names: string[] }; description: string }>
  ) {
    const groups: Record<
      string,
      Array<{
        type: { names: string[] };
        description: string;
        fullName: string;
        propertyName: string;
      }>
    > = {};

    returns.forEach(returnItem => {
      const cleanDescription = sanitizeHtml(returnItem.description, {
        allowedTags: [],
        allowedAttributes: {},
      });
      const nameMatch = cleanDescription.match(/([^ -]+)/);

      if (nameMatch) {
        const fullName = nameMatch[1].trim();
        let groupKey = '';
        let propertyName = '';

        if (fullName.includes('.') || fullName.includes('[].')) {
          // data.tableName, data.columns[].name 등의 경우
          if (fullName.includes('[].')) {
            // data.columns[].name -> data.columns[]
            const parts = fullName.split('[].');
            groupKey = `${parts[0]}[]`;
            propertyName = parts[1] || '';
          } else {
            // data.tableName -> data
            const parts = fullName.split('.');
            if (parts.length === 2) {
              groupKey = parts[0];
              propertyName = parts[1];
            } else if (parts.length > 2) {
              // data.pagination.page -> data.pagination
              groupKey = parts.slice(0, -1).join('.');
              propertyName = parts[parts.length - 1];
            }
          }
        } else {
          // success 등 최상위 레벨
          groupKey = 'root';
          propertyName = fullName;
        }

        if (!groups[groupKey]) {
          groups[groupKey] = [];
        }

        groups[groupKey].push({
          ...returnItem,
          fullName,
          propertyName,
        });
      }
    });

    return groups;
  }

  parseReturnName(description: string): string {
    const nameMatch = description.match(/([^ -]+)/);
    if (nameMatch) {
      if (nameMatch[1].includes('.')) {
        // [].property 패턴인 경우
        return nameMatch[1].split('.').pop()!.trim();
      }
      return nameMatch[1].trim();
    }

    return '반환값';
  }

  parseReturnDescription(description: string): string {
    // HTML 태그 제거하고 설명 부분만 추출
    const cleanDescription = sanitizeHtml(description, {
      allowedTags: [],
      allowedAttributes: {},
    });

    // [].property 패턴인 경우 "- 설명" 부분만 추출
    const match = cleanDescription.match(/\[]\.\w+\s*-\s*(.+)/);
    if (match) {
      return match[1].trim();
    }

    // 일반적인 경우 처리
    const descMatch = cleanDescription.match(/-\s*(.+)/);
    if (descMatch) {
      return descMatch[1].trim();
    }

    return cleanDescription.trim();
  }

  private generateMarkdownDocs(): string {
    let markdown = '# API 문서\n\n';
    markdown += `생성일: ${new Date().toLocaleString('ko-KR')}\n\n`;

    const groupedDocs = this.apiDocs.reduce(
      (groups, doc) => {
        const group = groups[doc.file] || [];
        group.push(doc);
        groups[doc.file] = group;
        return groups;
      },
      {} as Record<string, ApiDoc[]>
    );

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
            markdown += `- \`${param.name}\` (${param.type}) ${param.optional !== 'optional' ? '**필수**' : '*선택*'}: ${param.description}\n`;
          }
          markdown += '\n';
        }
        if (doc.returns && doc.returns.length > 0) {
          markdown += `**반환값:**\n\n`;
          for (const returnItem of doc.returns) {
            const name = this.parseReturnName(returnItem.description);
            const description = this.parseReturnDescription(
              returnItem.description
            );
            markdown += `- \`${name}\` (${returnItem.type.names.join(' | ')}): ${description}\n`;
          }
          markdown += '\n';
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
}
