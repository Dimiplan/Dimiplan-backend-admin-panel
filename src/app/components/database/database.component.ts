import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { AdminService, TableInfo, TableData } from '../../services/admin.service';

@Component({
  selector: 'app-database',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatBadgeModule,
    MatTooltipModule,
    MatChipsModule
  ],
  template: `
    <div class="p-4 md:p-6 bg-md-sys-color-surface h-full overflow-hidden flex flex-col pb-8">
      <h1 class="md-typescale-headline-large text-md-sys-color-on-surface mb-4 md:mb-6 flex-shrink-0">데이터베이스 관리</h1>

      <div class="flex flex-col lg:grid lg:grid-cols-3 gap-4 md:gap-6 flex-1 min-h-0">
        <!-- 테이블 목록 -->
        <div class="md-card bg-md-sys-color-surface-container text-md-sys-color-on-surface lg:col-span-1 flex flex-col min-h-0">
          <div class="flex items-center justify-between mb-4 flex-shrink-0">
            <h2 class="md-typescale-title-large text-md-sys-color-on-surface">테이블 목록</h2>
            <button class="md-button md-button-text p-3 rounded-full touch-target" (click)="refreshTables()">
              <mat-icon class="w-5 h-5 text-md-sys-color-primary">refresh</mat-icon>
            </button>
          </div>
          <div class="flex-1 overflow-y-auto min-h-0">
            <div *ngIf="tables.length > 0" class="space-y-2 pr-2">
              <div
                *ngFor="let table of tables"
                [class]="'flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ' + (selectedTable?.name === table.name ? 'bg-md-sys-color-secondary-container text-md-sys-color-on-secondary-container' : 'hover:bg-md-sys-color-surface-container-high')"
                (click)="selectTable(table)">
                <mat-icon class="w-6 h-6 flex-shrink-0" [class.text-md-sys-color-on-secondary-container]="selectedTable?.name === table.name">table_chart</mat-icon>
                <div class="flex-1">
                  <div class="md-typescale-body-large font-medium">{{ table.name }}</div>
                  <div class="flex items-center gap-2 mt-1">
                    <span class="px-2 py-1 bg-md-sys-color-primary-container text-md-sys-color-on-primary-container rounded-full text-xs">
                      {{ table.rowCount }}개 레코드
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div *ngIf="tables.length === 0 && !loadingTables" class="flex items-center justify-center h-48 text-md-sys-color-on-surface-variant">
              테이블이 없습니다.
            </div>
            <div *ngIf="loadingTables" class="flex flex-col items-center justify-center h-48 gap-4 text-md-sys-color-on-surface-variant">
              <mat-spinner diameter="40"></mat-spinner>
              <p class="md-typescale-body-medium">테이블 목록을 불러오는 중...</p>
            </div>
          </div>
        </div>

        <!-- 테이블 데이터 뷰어 -->
        <div class="md-card bg-md-sys-color-surface-container text-md-sys-color-on-surface lg:col-span-2 flex flex-col min-h-0">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2 flex-shrink-0">
            <h2 class="md-typescale-title-large text-md-sys-color-on-surface truncate">
              {{ selectedTable ? selectedTable.name : '테이블 뷰어' }}
            </h2>
            <div class="flex items-center gap-2" *ngIf="selectedTable">
              <button class="md-button md-button-text p-3 rounded-full touch-target" (click)="loadTableData()" [disabled]="loadingData">
                <mat-icon class="w-5 h-5 text-md-sys-color-primary">refresh</mat-icon>
              </button>
              <button class="md-button md-button-tonal px-4 py-2 rounded-full touch-target" (click)="exportTableData()" [disabled]="!tableData">
                <mat-icon class="w-5 h-5 mr-2">download</mat-icon>
                <span class="md-typescale-label-large hidden sm:inline">내보내기</span>
                <span class="md-typescale-label-large sm:hidden">내보내기</span>
              </button>
            </div>
          </div>
          <div class="flex-1 flex flex-col min-h-0">
            <div *ngIf="!selectedTable" class="flex items-center justify-center h-full text-md-sys-color-on-surface-variant">
              <div class="text-center">
                <mat-icon class="w-16 h-16 mb-4 text-md-sys-color-outline">table_view</mat-icon>
                <p class="md-typescale-body-large">왼쪽에서 테이블을 선택해주세요.</p>
              </div>
            </div>

            <div *ngIf="loadingData" class="flex flex-col items-center justify-center h-full gap-4 text-md-sys-color-on-surface-variant">
              <mat-spinner diameter="40"></mat-spinner>
              <p class="md-typescale-body-medium">테이블 데이터를 불러오는 중...</p>
            </div>

            <div *ngIf="tableData && !loadingData" class="flex flex-col h-full min-h-0">
              <!-- 컬럼 정보 -->
              <div class="mb-4 flex-shrink-0">
                <h3 class="md-typescale-title-medium text-md-sys-color-on-surface mb-3 flex items-center gap-2">
                  <mat-icon class="w-5 h-5 text-md-sys-color-primary">info</mat-icon>
                  컬럼 정보
                </h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 max-h-48 overflow-y-auto pr-2">
                  <div *ngFor="let column of tableData.columns" class="p-3 bg-md-sys-color-surface-container-high rounded-xl">
                    <div class="md-typescale-body-large font-medium text-md-sys-color-on-surface mb-2 truncate">{{ column.name }}</div>
                    <div class="flex flex-wrap gap-2">
                      <span class="px-2 py-1 rounded-full text-xs"
                            [class]="getColumnTypeColor(column.type) === 'primary' ? 'bg-md-sys-color-primary-container text-md-sys-color-on-primary-container' :
                                     getColumnTypeColor(column.type) === 'accent' ? 'bg-md-sys-color-secondary-container text-md-sys-color-on-secondary-container' :
                                     getColumnTypeColor(column.type) === 'warn' ? 'bg-md-sys-color-tertiary-container text-md-sys-color-on-tertiary-container' :
                                     'bg-md-sys-color-surface-container text-md-sys-color-on-surface'">
                        {{ column.type }}
                      </span>
                      <span *ngIf="column.key" class="px-2 py-1 bg-md-sys-color-error-container text-md-sys-color-on-error-container rounded-full text-xs">
                        {{ column.key }}
                      </span>
                      <span *ngIf="!column.nullable" class="px-2 py-1 bg-md-sys-color-secondary-container text-md-sys-color-on-secondary-container rounded-full text-xs">
                        NOT NULL
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 테이블 데이터 -->
              <div class="flex-1 flex flex-col min-h-0">
                <h3 class="md-typescale-title-medium text-md-sys-color-on-surface mb-3 flex items-center gap-2 flex-shrink-0">
                  <mat-icon class="w-5 h-5 text-md-sys-color-primary">table_rows</mat-icon>
                  데이터 ({{ tableData.pagination.totalCount }}개 레코드)
                </h3>
                <div class="flex-1 min-h-0 overflow-hidden border border-md-sys-color-outline-variant rounded-xl">
                  <div class="h-full overflow-auto">
                    <table mat-table [dataSource]="tableData.rows" class="w-full min-w-max">
                      <ng-container *ngFor="let column of tableData.columns" [matColumnDef]="column.name">
                        <th mat-header-cell *matHeaderCellDef class="bg-md-sys-color-surface-container-high sticky top-0 z-10">
                          <div class="flex items-center gap-2 md-typescale-label-large font-medium text-md-sys-color-on-surface">
                            <span>{{ column.name }}</span>
                            <mat-icon
                              *ngIf="column.key"
                              class="w-4 h-4 text-md-sys-color-primary"
                              [matTooltip]="getKeyTooltip(column.key)">
                              {{ getKeyIcon(column.key) }}
                            </mat-icon>
                          </div>
                        </th>
                        <td mat-cell *matCellDef="let row" class="border-b border-md-sys-color-outline-variant">
                          <div class="max-w-xs overflow-hidden text-ellipsis whitespace-nowrap md-typescale-body-medium text-md-sys-color-on-surface"
                               [matTooltip]="formatCellValue(row[column.name])"
                               matTooltipPosition="above"
                               [matTooltipDisabled]="formatCellValue(row[column.name]).length < 30">
                            {{ formatCellValue(row[column.name]) }}
                          </div>
                        </td>
                      </ng-container>

                      <tr mat-header-row *matHeaderRowDef="getDisplayedColumns(); sticky: true"></tr>
                      <tr mat-row *matRowDef="let row; columns: getDisplayedColumns()" class="hover:bg-md-sys-color-surface-container-high"></tr>
                    </table>
                  </div>
                </div>

                <!-- 페이지네이션 -->
                <div class="mt-4 flex-shrink-0">
                  <mat-paginator
                    [length]="tableData.pagination.totalCount"
                    [pageSize]="tableData.pagination.limit"
                    [pageIndex]="tableData.pagination.page - 1"
                    [pageSizeOptions]="[25, 50, 100, 200]"
                    (page)="onPageChange($event)"
                    showFirstLastButtons
                    class="bg-md-sys-color-surface-container rounded-xl">
                  </mat-paginator>
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
      min-height: 400px;
      border-bottom: 2px solid var(--md-sys-color-outline-variant);
    }

    @media (max-width: 1023px) {
      .flex.flex-col.lg\\:grid {
        display: flex !important;
        flex-direction: column !important;
      }

      .md-card {
        min-height: 300px;
        margin-bottom: 1rem;
        border-bottom: 2px solid var(--md-sys-color-outline-variant);
      }
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
  `]
})
export class DatabaseComponent implements OnInit {
  tables: TableInfo[] = [];
  selectedTable: TableInfo | null = null;
  tableData: TableData | null = null;
  loadingTables = false;
  loadingData = false;
  currentPage = 1;
  pageSize = 50;

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadTables();
  }

  loadTables() {
    this.loadingTables = true;
    this.adminService.getDatabaseTables().subscribe({
      next: (response) => {
        if (response.success) {
          this.tables = response.data;
        }
        this.loadingTables = false;
      },
      error: (error) => {
        console.error('테이블 목록 로드 실패:', error);
        this.loadingTables = false;
      }
    });
  }

  selectTable(table: TableInfo) {
    this.selectedTable = table;
    this.tableData = null;
    this.currentPage = 1;
    this.loadTableData();
  }

  loadTableData() {
    if (!this.selectedTable) return;

    this.loadingData = true;
    this.adminService.getTableData(this.selectedTable.name, this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        if (response.success) {
          this.tableData = response.data;
        }
        this.loadingData = false;
      },
      error: (error) => {
        console.error('테이블 데이터 로드 실패:', error);
        this.loadingData = false;
      }
    });
  }

  refreshTables() {
    this.loadTables();
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadTableData();
  }

  getDisplayedColumns(): string[] {
    return this.tableData ? this.tableData.columns.map(col => col.name) : [];
  }

  formatCellValue(value: any): string {
    if (value === null || value === undefined) {
      return 'NULL';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  }

  getColumnTypeColor(type: string): 'primary' | 'accent' | 'warn' | undefined {
    if (type.includes('int') || type.includes('decimal') || type.includes('float')) {
      return 'primary';
    }
    if (type.includes('varchar') || type.includes('text') || type.includes('char')) {
      return 'accent';
    }
    if (type.includes('datetime') || type.includes('timestamp') || type.includes('date')) {
      return 'warn';
    }
    return undefined;
  }

  getKeyIcon(key: string): string {
    switch (key) {
      case 'PRI': return 'key';
      case 'UNI': return 'fingerprint';
      case 'MUL': return 'link';
      default: return 'info';
    }
  }

  getKeyTooltip(key: string): string {
    switch (key) {
      case 'PRI': return 'Primary Key';
      case 'UNI': return 'Unique Key';
      case 'MUL': return 'Multiple Key (Index)';
      default: return key;
    }
  }

  exportTableData() {
    if (!this.tableData) return;

    const csvContent = this.convertToCSV(this.tableData);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.tableData.tableName}_data.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  private convertToCSV(data: TableData): string {
    const headers = data.columns.map(col => col.name).join(',');
    const rows = data.rows.map(row =>
      data.columns.map(col => {
        const value = row[col.name];
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        // CSV에서 쉼표와 따옴표 이스케이프
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    ).join('\n');

    return `${headers}\n${rows}`;
  }
}
