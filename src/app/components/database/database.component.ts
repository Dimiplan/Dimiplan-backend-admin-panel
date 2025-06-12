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
    <div class="database-container">
      <h1>데이터베이스 관리</h1>

      <div class="database-layout">
        <!-- 테이블 목록 -->
        <mat-card class="table-list-card">
          <mat-card-header>
            <mat-card-title>테이블 목록</mat-card-title>
            <button mat-icon-button (click)="refreshTables()">
              <mat-icon>refresh</mat-icon>
            </button>
          </mat-card-header>
          <mat-card-content>
            <mat-list *ngIf="tables.length > 0">
              <mat-list-item 
                *ngFor="let table of tables" 
                [class.selected]="selectedTable?.name === table.name"
                (click)="selectTable(table)">
                <mat-icon matListItemIcon>table_chart</mat-icon>
                <div matListItemTitle>{{ table.name }}</div>
                <div matListItemLine>
                  <mat-chip>
                    {{ table.rowCount }}개 레코드
                  </mat-chip>
                </div>
              </mat-list-item>
            </mat-list>
            <div *ngIf="tables.length === 0 && !loadingTables" class="no-tables">
              테이블이 없습니다.
            </div>
            <div *ngIf="loadingTables" class="loading-center">
              <mat-spinner diameter="40"></mat-spinner>
              <p>테이블 목록을 불러오는 중...</p>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- 테이블 데이터 뷰어 -->
        <mat-card class="table-viewer-card">
          <mat-card-header>
            <mat-card-title>
              {{ selectedTable ? selectedTable.name : '테이블 뷰어' }}
            </mat-card-title>
            <div class="viewer-controls" *ngIf="selectedTable">
              <button mat-icon-button (click)="loadTableData()" [disabled]="loadingData">
                <mat-icon>refresh</mat-icon>
              </button>
              <button mat-icon-button (click)="exportTableData()" [disabled]="!tableData">
                <mat-icon>download</mat-icon>
              </button>
            </div>
          </mat-card-header>
          <mat-card-content>
            <div *ngIf="!selectedTable" class="no-selection">
              왼쪽에서 테이블을 선택해주세요.
            </div>

            <div *ngIf="loadingData" class="loading-center">
              <mat-spinner diameter="40"></mat-spinner>
              <p>테이블 데이터를 불러오는 중...</p>
            </div>

            <div *ngIf="tableData && !loadingData" class="table-content">
              <!-- 컬럼 정보 -->
              <div class="column-info">
                <h3>컬럼 정보</h3>
                <div class="columns-grid">
                  <div *ngFor="let column of tableData.columns" class="column-card">
                    <div class="column-name">{{ column.name }}</div>
                    <div class="column-details">
                      <mat-chip [color]="getColumnTypeColor(column.type)">{{ column.type }}</mat-chip>
                      <mat-chip *ngIf="column.key" color="warn">{{ column.key }}</mat-chip>
                      <mat-chip *ngIf="!column.nullable" color="accent">NOT NULL</mat-chip>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 테이블 데이터 -->
              <div class="data-section">
                <h3>데이터 ({{ tableData.pagination.totalCount }}개 레코드)</h3>
                <div class="table-container">
                  <table mat-table [dataSource]="tableData.rows" class="data-table">
                    <ng-container *ngFor="let column of tableData.columns" [matColumnDef]="column.name">
                      <th mat-header-cell *matHeaderCellDef>
                        <div class="header-cell">
                          <span>{{ column.name }}</span>
                          <mat-icon 
                            *ngIf="column.key" 
                            class="key-icon"
                            [matTooltip]="getKeyTooltip(column.key)">
                            {{ getKeyIcon(column.key) }}
                          </mat-icon>
                        </div>
                      </th>
                      <td mat-cell *matCellDef="let row">
                        <div class="cell-content" [matTooltip]="formatCellValue(row[column.name])">
                          {{ formatCellValue(row[column.name]) }}
                        </div>
                      </td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="getDisplayedColumns()"></tr>
                    <tr mat-row *matRowDef="let row; columns: getDisplayedColumns()"></tr>
                  </table>
                </div>

                <!-- 페이지네이션 -->
                <mat-paginator 
                  [length]="tableData.pagination.totalCount"
                  [pageSize]="tableData.pagination.limit"
                  [pageIndex]="tableData.pagination.page - 1"
                  [pageSizeOptions]="[25, 50, 100, 200]"
                  (page)="onPageChange($event)"
                  showFirstLastButtons>
                </mat-paginator>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .database-container {
      padding: 20px;
      height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .database-layout {
      display: grid;
      grid-template-columns: 350px 1fr;
      gap: 20px;
      flex: 1;
      min-height: 0;
    }

    .table-list-card, .table-viewer-card {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .table-list-card mat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .table-list-card mat-card-content {
      flex: 1;
      overflow-y: auto;
    }

    .table-viewer-card mat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .viewer-controls {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .table-viewer-card mat-card-content {
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .table-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
      overflow: auto;
    }

    .column-info {
      margin-bottom: 24px;
    }

    .column-info h3 {
      margin: 0 0 16px 0;
      color: rgba(0, 0, 0, 0.87);
    }

    .columns-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 12px;
    }

    .column-card {
      padding: 12px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background-color: #fafafa;
    }

    .column-name {
      font-weight: 500;
      margin-bottom: 8px;
      color: rgba(0, 0, 0, 0.87);
    }

    .column-details {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }

    .data-section {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
    }

    .data-section h3 {
      margin: 0 0 16px 0;
      color: rgba(0, 0, 0, 0.87);
    }

    .table-container {
      flex: 1;
      overflow: auto;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
    }

    .data-table {
      width: 100%;
      min-width: 600px;
    }

    .header-cell {
      display: flex;
      align-items: center;
      gap: 4px;
      font-weight: 500;
    }

    .key-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .cell-content {
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .selected {
      background-color: rgba(63, 81, 181, 0.1);
    }

    .no-tables, .no-selection {
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

    mat-paginator {
      border-top: 1px solid #e0e0e0;
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