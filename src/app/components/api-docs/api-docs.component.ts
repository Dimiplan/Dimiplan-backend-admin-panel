import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { MatSelectModule } from '@angular/material/select';
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
    MatSelectModule,
    FormsModule
  ],
  template: `
    <div class="p-4 md:p-6 pb-20 bg-md-sys-color-surface h-screen max-w-6xl mx-auto flex flex-col mb-8 overflow-y-scroll">
      <h1 class="md-typescale-headline-large text-md-sys-color-on-surface mb-4 md:mb-6">API 문서</h1>

      <div class="flex flex-col gap-4 mb-6">
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="flex-1">
            <div class="relative">
              <input
                type="text"
                [(ngModel)]="searchTerm"
                (input)="filterApis()"
                placeholder="경로나 설명으로 검색..."
                class="w-full p-3 pr-12 bg-md-sys-color-surface-container-highest text-md-sys-color-on-surface rounded-xl border border-md-sys-color-outline focus:border-md-sys-color-primary focus:outline-none md-typescale-body-large touch-target">
              <mat-icon class="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-md-sys-color-on-surface-variant">search</mat-icon>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <div class="relative" (click)="$event.stopPropagation()">
              <button
                (click)="toggleFileDropdown()"
                class="flex items-center gap-2 px-4 py-3 bg-md-sys-color-surface-container-highest text-md-sys-color-on-surface rounded-xl border border-md-sys-color-outline hover:bg-md-sys-color-surface-container-high transition-all md-typescale-body-large min-w-[200px] text-left">
                <mat-icon class="w-5 h-5" [class]="selectedFile ? 'text-md-sys-color-primary' : 'text-md-sys-color-on-surface-variant'">
                  {{ selectedFile ? 'folder_open' : 'folder' }}
                </mat-icon>
                <span class="flex-1 truncate">{{ selectedFile || '모든 경로' }}</span>
                <mat-icon class="w-5 h-5 text-md-sys-color-on-surface-variant">{{ showFileDropdown ? 'expand_less' : 'expand_more' }}</mat-icon>
              </button>

              <div *ngIf="showFileDropdown" class="absolute top-full left-0 right-0 mt-2 max-h-64 overflow-y-auto bg-md-sys-color-surface-container rounded-xl border border-md-sys-color-outline shadow-elevation-2 z-50">
								<button
									(click)="selectFile('')"
									class="w-full flex items-center gap-2 px-4 py-3 hover:bg-md-sys-color-surface-container-high transition-all text-left text-md-sys-color-on-surface">
									<mat-icon class="w-5 h-5 text-md-sys-color-on-surface-variant">select_all</mat-icon>
									<span class="md-typescale-body-medium text-md-sys-color-on-surface">모든 경로</span>
								</button>
								<button
									*ngFor="let file of getUniqueFiles()"
									(click)="selectFile(file)"
									[class]="'w-full flex items-center gap-2 px-4 py-3 hover:bg-md-sys-color-surface-container-high transition-all text-left ' + (selectedFile === file ? 'bg-md-sys-color-primary-container text-md-sys-color-on-primary-container' : 'text-md-sys-color-on-surface')">
									<mat-icon class="w-5 h-5" [class]="selectedFile === file ? 'text-md-sys-color-primary' : 'text-md-sys-color-on-surface-variant'">description</mat-icon>
									<span class="font-mono text-sm truncate">{{ file }}</span>
								</button>
              </div>
            </div>

            <button class="md-button md-button-text p-3 rounded-full touch-target" (click)="refreshDocs()" [disabled]="loading" title="새로고침">
              <mat-icon class="w-5 h-5 text-md-sys-color-primary">refresh</mat-icon>
            </button>
            <button class="md-button md-button-text p-3 rounded-full touch-target" (click)="regenerateDocs()" [disabled]="loading" title="JSDoc 재생성">
              <mat-icon class="w-5 h-5 text-md-sys-color-primary">autorenew</mat-icon>
            </button>
            <button class="md-button md-button-filled px-4 py-2 rounded-full touch-target" (click)="exportDocs()" [disabled]="!apiDocs.length">
              <mat-icon class="w-5 h-5 mr-2">download</mat-icon>
              <span class="md-typescale-label-large">내보내기</span>
            </button>
          </div>
        </div>
      </div>

      <div *ngIf="loading" class="flex flex-col items-center justify-center py-20 gap-4">
        <mat-spinner diameter="40" aria-label="API 문서 로딩 중"></mat-spinner>
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
				<div class="mb-8 overflow-y-scroll">
					<mat-accordion class="space-y-4">
						<mat-expansion-panel *ngFor="let doc of filteredDocs; trackBy: trackByPath" class="api-expansion-panel">
							<mat-expansion-panel-header class="api-panel-header">
								<mat-panel-title>
									<div class="flex items-center gap-3 flex-wrap w-full">
										<span class="px-3 py-1 rounded-full text-sm font-medium min-w-[60px] text-center flex-shrink-0"
													[class]="getMethodColor(doc.method) === 'primary' ? 'bg-md-sys-color-primary text-md-sys-color-on-primary' :
																	getMethodColor(doc.method) === 'accent' ? 'bg-md-sys-color-secondary text-md-sys-color-on-secondary' :
																	getMethodColor(doc.method) === 'warn' ? 'bg-md-sys-color-error text-md-sys-color-on-error' :
																	'bg-md-sys-color-surface-container-high text-md-sys-color-on-surface'">
											{{ doc.method }}
										</span>
										<span class="font-mono md-typescale-title-medium font-medium text-md-sys-color-on-surface break-all flex-1">{{ doc.path }}</span>
									</div>
								</mat-panel-title>
								<mat-panel-description>
									<span class="md-typescale-body-medium text-md-sys-color-on-surface-variant truncate">{{ doc.name }}</span>
								</mat-panel-description>
							</mat-expansion-panel-header>

							<div class="space-y-6 pt-4">
								<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-md-sys-color-surface-container-high rounded-xl">
									<div class="flex items-center gap-2">
										<span class="md-typescale-body-medium font-medium text-md-sys-color-on-surface-variant">파일:</span>
										<span class="font-mono md-typescale-body-medium text-md-sys-color-on-surface">{{ doc.file }}</span>
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
													<code class="px-2 py-1 bg-md-sys-color-surface-container rounded text-sm font-mono text-md-sys-color-on-surface">{{ routeParam.name }}</code>
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
																[class]="param.optional != 'optional' ? 'bg-md-sys-color-error-container text-md-sys-color-on-error-container' : 'bg-md-sys-color-surface-container text-md-sys-color-on-surface'">{{ param.optional != 'optional' ? '필수' : '선택' }}</span>
												</div>
												<span class="text-sm font-mono text-md-sys-color-on-surface-variant">{{ param.type }}</span>
											</div>
											<p class="md-typescale-body-small text-md-sys-color-on-surface-variant">{{ param.description }}</p>
										</div>
									</div>
								</div>

								<div *ngIf="doc.returns && doc.returns.length > 0" class="space-y-2">
									<h4 class="md-typescale-title-small text-md-sys-color-on-surface flex items-center gap-2">
										<mat-icon class="w-5 h-5 text-md-sys-color-primary">keyboard_return</mat-icon>
										반환값
									</h4>
									<div class="space-y-4">
										<!-- Root 레벨 아이템들 (그룹화되지 않은 것들) -->
										<div *ngFor="let returnItem of getReturnsByGroup(doc.returns, 'root')"
												class="p-3 bg-md-sys-color-tertiary-container rounded-lg">
											<div class="flex items-start justify-between mb-2">
												<div class="flex items-center gap-2">
													<code class="px-2 py-1 bg-md-sys-color-surface-container rounded text-sm font-mono text-md-sys-color-on-surface">
														{{ returnItem.fullName }}
													</code>
												</div>
												<span class="text-sm font-mono text-md-sys-color-on-tertiary-container">{{ returnItem.type.names.join(' | ') }}</span>
											</div>
											<p class="md-typescale-body-small text-md-sys-color-on-tertiary-container" [innerHTML]="parseReturnDescription(returnItem.description)"></p>
										</div>

										<!-- 그룹화된 아이템들을 위한 단일 accordion -->
										<mat-accordion class="space-y-2" multi>
											<mat-expansion-panel *ngFor="let group of getGroupedReturnsWithoutRoot(doc.returns) | keyvalue"
																					class="returns-expansion-panel"
																					[expanded]="false">
												<mat-expansion-panel-header class="returns-panel-header">
													<mat-panel-title>
														<div class="flex items-center gap-2">
															<mat-icon class="w-4 h-4 text-md-sys-color-primary">
																{{ group.key.includes('[]') ? 'view_list' : 'folder' }}
															</mat-icon>
															<code class="px-2 py-1 bg-md-sys-color-primary-container text-md-sys-color-on-primary-container rounded text-sm font-mono font-medium">{{ group.key }}</code>
															<span class="text-xs text-md-sys-color-on-surface-variant">
																{{ group.key.includes('[]') ? '배열' : '객체' }}
															</span>
															<span class="text-xs text-md-sys-color-on-surface-variant opacity-70">
																({{ group.value.length }}개 속성)
															</span>
														</div>
													</mat-panel-title>
												</mat-expansion-panel-header>

												<div class="space-y-2 pt-2">
													<div *ngFor="let returnItem of group.value" class="p-3 bg-md-sys-color-tertiary-container rounded-lg">
														<div class="flex items-start justify-between mb-2">
															<div class="flex items-center gap-2">
																<code class="px-2 py-1 bg-md-sys-color-surface-container rounded text-sm font-mono text-md-sys-color-on-surface">
																	{{ returnItem.propertyName }}
																</code>
																<span class="text-xs text-md-sys-color-on-tertiary-container opacity-70">
																	{{ returnItem.fullName }}
																</span>
															</div>
															<span class="text-sm font-mono text-md-sys-color-on-tertiary-container">{{ returnItem.type.names.join(' | ') }}</span>
														</div>
														<p class="md-typescale-body-small text-md-sys-color-on-tertiary-container" [innerHTML]="parseReturnDescription(returnItem.description)"></p>
													</div>
												</div>
											</mat-expansion-panel>
										</mat-accordion>
									</div>
								</div>

								<div class="space-y-2">
									<h4 class="md-typescale-title-small text-md-sys-color-on-surface flex items-center gap-2">
										<mat-icon class="w-5 h-5 text-md-sys-color-primary">code</mat-icon>
										사용 예시
									</h4>
									<div class="relative bg-gray-900 text-gray-100 rounded-xl overflow-hidden">
										<pre class="p-4 overflow-x-auto font-mono text-sm leading-relaxed"><code>{{ generateCurlExample(doc) }}</code></pre>
										<button class="absolute top-3 right-3 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all"
														(click)="copyCurl(doc)"
														[title]="copiedDocId === doc.method + '-' + doc.path ? '복사됨!' : '클립보드에 복사'">
											<mat-icon class="w-5 h-5 transition-all"
																[class]="copiedDocId === doc.method + '-' + doc.path ? 'text-green-400' : 'text-gray-300'">
												{{ copiedDocId === doc.method + '-' + doc.path ? 'check' : 'content_copy' }}
											</mat-icon>
										</button>
									</div>
								</div>
							</div>
						</mat-expansion-panel>
					</mat-accordion>
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

    .filter-field {
      background-color: var(--md-sys-color-surface-container-highest) !important;
    }

    .filter-field .mat-mdc-form-field-flex {
      border-radius: 12px;
      transition: all 0.3s ease;
      background-color: var(--md-sys-color-surface-container-highest) !important;
    }

    .filter-field .mat-mdc-form-field-outline {
      background-color: var(--md-sys-color-surface-container-highest) !important;
    }

    .filter-field:hover .mat-mdc-form-field-flex {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .filter-field.mat-focused .mat-mdc-form-field-flex {
      box-shadow: 0 0 0 2px var(--md-sys-color-primary);
    }

    .filter-option {
      padding: 12px 16px !important;
      min-height: 48px !important;
      transition: background-color 0.2s ease;
      background-color: var(--md-sys-color-surface) !important;
    }

    .filter-option:hover {
      background-color: var(--md-sys-color-surface-container-high) !important;
    }

    .custom-select {
      background-color: var(--md-sys-color-surface-container-highest) !important;
    }

    .custom-select .mat-mdc-select-value {
      display: flex;
      align-items: center;
      gap: 8px;
      background-color: transparent !important;
    }

    .mat-mdc-select-panel {
      background-color: var(--md-sys-color-surface) !important;
    }

    .mat-mdc-form-field-subscript-wrapper {
      background-color: transparent !important;
    }

    .returns-expansion-panel {
      background-color: var(--md-sys-color-surface-container-high) !important;
      border-radius: 12px !important;
      margin-bottom: 8px !important;
      box-shadow: none !important;
      border: 1px solid var(--md-sys-color-outline-variant) !important;
    }

    .returns-expansion-panel .mat-expansion-panel-header {
      background-color: var(--md-sys-color-surface-container-high) !important;
      padding: 16px 24px !important;
      border-radius: 12px !important;
      height: auto !important;
      min-height: auto !important;
    }

    .returns-expansion-panel .mat-expansion-panel-body {
      background-color: var(--md-sys-color-surface-container-high) !important;
      padding: 0 24px 16px 24px !important;
    }

    .returns-expansion-panel .mat-expansion-panel-header-title {
      margin-right: 0 !important;
      flex: 1 !important;
    }

    .returns-expansion-panel.mat-expanded .mat-expansion-panel-header {
      border-bottom: 1px solid var(--md-sys-color-outline-variant) !important;
    }

    .returns-expansion-panel .mat-expansion-indicator::after {
      color: var(--md-sys-color-on-surface-variant) !important;
    }

    .filter-dropdown {
      backdrop-filter: blur(8px);
      background-color: rgba(var(--md-sys-color-surface-container-rgb), 0.95);
    }

    .api-expansion-panel {
      background-color: var(--md-sys-color-surface-container) !important;
      border-radius: 16px !important;
      margin-bottom: 16px !important;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
      border: 1px solid var(--md-sys-color-outline-variant) !important;
      transition: all 0.3s ease !important;
    }

    .api-expansion-panel:hover {
      transform: translateY(-2px) !important;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15) !important;
    }

    .api-expansion-panel .mat-expansion-panel-header {
      background-color: var(--md-sys-color-surface-container) !important;
      padding: 20px 24px !important;
      border-radius: 16px !important;
      height: auto !important;
      min-height: auto !important;
    }

    .api-expansion-panel .mat-expansion-panel-body {
      background-color: var(--md-sys-color-surface-container) !important;
      padding: 0 24px 24px 24px !important;
    }

    .api-expansion-panel .mat-expansion-panel-header-title {
      margin-right: 0 !important;
      flex: 1 !important;
    }

    .api-expansion-panel .mat-expansion-panel-header-description {
      margin-right: 16px !important;
      flex: 1 !important;
      max-width: 300px !important;
    }

    .api-expansion-panel.mat-expanded .mat-expansion-panel-header {
      border-bottom: 1px solid var(--md-sys-color-outline-variant) !important;
    }

    .api-expansion-panel .mat-expansion-indicator::after {
      color: var(--md-sys-color-on-surface-variant) !important;
    }
  `]
})
export class ApiDocsComponent implements OnInit, OnDestroy {
  apiDocs: ApiDoc[] = [];
  filteredDocs: ApiDoc[] = [];
  searchTerm = '';
  selectedFile = '';
  loading = false;
  showFileDropdown = false;
  copiedDocId: string | null = null;

  constructor(private adminService: AdminService) {}

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
  }

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
      next: (response) => {
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
      error: (error) => {
        console.error('API 문서 로드 실패:', error);
        this.loading = false;
      }
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
      filtered = filtered.filter(doc =>
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

    this.filteredDocs = filtered;
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
      this.copiedDocId = `${doc.method}-${doc.path}`;
      setTimeout(() => {
        this.copiedDocId = null;
      }, 2000);
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

  trackByPath(index: number, doc: ApiDoc): string {
    return doc.path + doc.method;
  }

	getReturnsByGroup(returns: Array<{ type: { names: string[] }; description: string }>, groupKey: string) {
		const groups = this.groupReturns(returns);
		if (groups[groupKey]) {
			return groups[groupKey];
		}
		return [];
	}

	getGroupedReturnsWithoutRoot(returns: Array<{ type: { names: string[] }; description: string }>) {
		const groups = this.groupReturns(returns);
		const result: Record<string, any[]> = {};

		for (const [key, value] of Object.entries(groups)) {
			if (key !== 'root') {
				result[key] = value;
			}
		}

		return result;
	}


  groupReturns(returns: Array<{ type: { names: string[] }; description: string }>) {
    const groups: Record<string, Array<{ type: { names: string[] }; description: string; fullName: string; propertyName: string }>> = {};

    returns.forEach(returnItem => {
      const cleanDescription = returnItem.description.replace(/<[^>]*>/g, '');
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
            groupKey = parts[0] + '[]';
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
          propertyName
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
				return nameMatch[1].split('.').pop()?.trim()!;
			}
      return nameMatch[1].trim();
    }

    return '반환값';
  }

  parseReturnDescription(description: string): string {
    // HTML 태그 제거하고 설명 부분만 추출
    const cleanDescription = description.replace(/<[^>]*>/g, '');

    // [].property 패턴인 경우 "- 설명" 부분만 추출
    const match = cleanDescription.match(/\[\]\.\w+\s*-\s*(.+)/);
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
            markdown += `- \`${param.name}\` (${param.type}) ${param.optional != "optional" ? '**필수**' : '*선택*'}: ${param.description}\n`;
          }
          markdown += '\n';
        }
        if (doc.returns && doc.returns.length > 0) {
          markdown += `**반환값:**\n\n`;
          for (const returnItem of doc.returns) {
            const name = this.parseReturnName(returnItem.description);
            const description = this.parseReturnDescription(returnItem.description);
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
