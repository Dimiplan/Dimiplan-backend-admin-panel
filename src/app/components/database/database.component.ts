import { Component, OnInit, inject } from '@angular/core';
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
import { MatDialogModule, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snackbar';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import {
  AdminService,
  TableInfo,
  TableData,
} from '../../services/admin.service';

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
    MatChipsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    ReactiveFormsModule,
  ],
  templateUrl: './database.component.html',
})
export class DatabaseComponent implements OnInit {
  private adminService = inject(AdminService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);

  tables: TableInfo[] = [];
  selectedTable: TableInfo | null = null;
  tableData: TableData | null = null;
  loadingTables = false;
  loadingData = false;
  currentPage = 1;

  ngOnInit() {
    this.loadTables();
  }

  loadTables() {
    this.loadingTables = true;
    this.adminService.getDatabaseTables().subscribe({
      next: response => {
        if (response.success) {
          this.tables = response.data;
        }
        this.loadingTables = false;
      },
      error: error => {
        console.error('테이블 목록 로드 실패:', error);
        this.loadingTables = false;
      },
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
    this.adminService
      .getTableData(this.selectedTable.name, this.currentPage, 10)
      .subscribe({
        next: response => {
          if (response.success) {
            this.tableData = response.data;
          }
          this.loadingData = false;
        },
        error: error => {
          console.error('테이블 데이터 로드 실패:', error);
          this.loadingData = false;
        },
      });
  }

  refreshTables() {
    this.loadTables();
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex + 1;
    this.loadTableData();
  }

  getDisplayedColumns(): string[] {
    return this.tableData ? this.tableData.columns.map(col => col.name) : [];
  }

  getDisplayedColumnsWithActions(): string[] {
    const columns = this.getDisplayedColumns();
    return [...columns, 'actions'];
  }

  formatCellValue(value: unknown): string {
    if (value === null || value === undefined) {
      return 'NULL';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  }

  getColumnTypeColor(type: string): 'primary' | 'accent' | 'warn' | undefined {
    if (
      type.includes('int') ||
      type.includes('decimal') ||
      type.includes('float')
    ) {
      return 'primary';
    }
    if (
      type.includes('varchar') ||
      type.includes('text') ||
      type.includes('char')
    ) {
      return 'accent';
    }
    if (
      type.includes('datetime') ||
      type.includes('timestamp') ||
      type.includes('date')
    ) {
      return 'warn';
    }
    return undefined;
  }

  getKeyIcon(key: string): string {
    switch (key) {
      case 'PRI':
        return 'key';
      case 'UNI':
        return 'fingerprint';
      case 'MUL':
        return 'link';
      default:
        return 'info';
    }
  }

  getKeyTooltip(key: string): string {
    switch (key) {
      case 'PRI':
        return 'Primary Key';
      case 'UNI':
        return 'Unique Key';
      case 'MUL':
        return 'Multiple Key (Index)';
      default:
        return key;
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
    const rows = data.rows
      .map(row =>
        data.columns
          .map(col => {
            const value = row[col.name];
            if (value === null || value === undefined) return '';
            const stringValue = String(value);
            // CSV에서 쉼표와 따옴표 이스케이프
            if (
              stringValue.includes(',') ||
              stringValue.includes('"') ||
              stringValue.includes('\n')
            ) {
              return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
          })
          .join(',')
      )
      .join('\n');

    return `${headers}\n${rows}`;
  }

  copyToClipboard(text: string) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        this.snackBar.open('클립보드에 복사되었습니다', '닫기', {
          duration: 2000,
        });
      })
      .catch(err => {
        console.error('복사 실패:', err);
        this.snackBar.open('복사에 실패했습니다', '닫기', {
          duration: 2000,
        });
      });
  }

  openAddRowDialog() {
    if (!this.tableData) return;

    const dialogRef = this.dialog.open(DatabaseRowDialogComponent, {
      width: '600px',
      data: {
        mode: 'add',
        columns: this.tableData.columns,
        row: null,
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.addRow(result);
      }
    });
  }

  openEditRowDialog(row: Record<string, unknown>) {
    if (!this.tableData) return;

    const dialogRef = this.dialog.open(DatabaseRowDialogComponent, {
      width: '600px',
      data: {
        mode: 'edit',
        columns: this.tableData.columns,
        row,
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateRow(row, result);
      }
    });
  }

  confirmDeleteRow(row: Record<string, unknown>) {
    if (!this.selectedTable) return;

    const primaryKeys = this.getPrimaryKeys();
    const whereClause: Record<string, unknown> = {};
    
    primaryKeys.forEach(key => {
      whereClause[key] = row[key];
    });

    if (confirm('정말 이 행을 삭제하시겠습니까?')) {
      this.deleteRow(whereClause);
    }
  }

  private getPrimaryKeys(): string[] {
    if (!this.tableData) return [];
    
    // 테이블별 기본 키 설정
    const tableName = this.selectedTable?.name;
    if (tableName === 'users') {
      return ['id'];
    } else if (tableName === 'userid') {
      return ['owner'];
    } else {
      return ['id', 'owner'];
    }
  }

  private addRow(data: Record<string, unknown>) {
    if (!this.selectedTable) return;

    this.adminService.addTableRow(this.selectedTable.name, data).subscribe({
      next: response => {
        if (response.success) {
          this.snackBar.open('데이터가 추가되었습니다', '닫기', {
            duration: 3000,
          });
          this.loadTableData();
        }
      },
      error: error => {
        console.error('데이터 추가 실패:', error);
        this.snackBar.open('데이터 추가에 실패했습니다', '닫기', {
          duration: 3000,
        });
      },
    });
  }

  private updateRow(originalRow: Record<string, unknown>, newData: Record<string, unknown>) {
    if (!this.selectedTable) return;

    const primaryKeys = this.getPrimaryKeys();
    const whereClause: Record<string, unknown> = {};
    
    primaryKeys.forEach(key => {
      whereClause[key] = originalRow[key];
    });

    this.adminService.updateTableRow(this.selectedTable.name, newData, whereClause).subscribe({
      next: response => {
        if (response.success) {
          this.snackBar.open('데이터가 수정되었습니다', '닫기', {
            duration: 3000,
          });
          this.loadTableData();
        }
      },
      error: error => {
        console.error('데이터 수정 실패:', error);
        this.snackBar.open('데이터 수정에 실패했습니다', '닫기', {
          duration: 3000,
        });
      },
    });
  }

  private deleteRow(whereClause: Record<string, unknown>) {
    if (!this.selectedTable) return;

    this.adminService.deleteTableRow(this.selectedTable.name, whereClause).subscribe({
      next: response => {
        if (response.success) {
          this.snackBar.open('데이터가 삭제되었습니다', '닫기', {
            duration: 3000,
          });
          this.loadTableData();
        }
      },
      error: error => {
        console.error('데이터 삭제 실패:', error);
        this.snackBar.open('데이터 삭제에 실패했습니다', '닫기', {
          duration: 3000,
        });
      },
    });
  }
}

@Component({
  selector: 'app-database-row-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    ReactiveFormsModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.mode === 'add' ? '행 추가' : '행 편집' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="space-y-4">
        @for (column of data.columns; track column.name) {
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>{{ column.name }}</mat-label>
            @if (column.type.includes('text') || column.type.includes('varchar')) {
              <input
                matInput
                [formControlName]="column.name"
                [readonly]="isReadonly(column)"
              />
            } @else if (column.type.includes('int')) {
              <input
                matInput
                type="number"
                [formControlName]="column.name"
                [readonly]="isReadonly(column)"
              />
            } @else {
              <input
                matInput
                [formControlName]="column.name"
                [readonly]="isReadonly(column)"
              />
            }
            <mat-hint>{{ column.type }} {{ column.nullable ? '' : '(필수)' }}</mat-hint>
          </mat-form-field>
        }
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>취소</button>
      <button
        mat-raised-button
        color="primary"
        (click)="save()"
        [disabled]="!form.valid"
      >
        {{ data.mode === 'add' ? '추가' : '수정' }}
      </button>
    </mat-dialog-actions>
  `,
})
export class DatabaseRowDialogComponent {
  data = inject<{
    mode: 'add' | 'edit';
    columns: Array<{
      name: string;
      type: string;
      nullable: boolean;
      key?: string;
      extra?: string;
      default?: string;
    }>;
    row: Record<string, unknown> | null;
  }>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<DatabaseRowDialogComponent>);
  private fb = inject(FormBuilder);

  form: FormGroup;

  constructor() {
    this.form = this.createForm();
  }

  private createForm(): FormGroup {
    const formControls: Record<string, unknown> = {};
    
    this.data.columns.forEach((column) => {
      const value = this.data.mode === 'edit' && this.data.row
        ? this.data.row[column.name]
        : column.default || '';
      
      formControls[column.name] = [value];
    });

    return this.fb.group(formControls);
  }

  isReadonly(column: { key?: string; extra?: string }): boolean {
    // Primary key나 auto increment 컬럼은 편집 모드에서 읽기 전용
    return this.data.mode === 'edit' && (column.key === 'PRI' || column.extra === 'auto_increment');
  }

  save() {
    if (this.form.valid) {
      const formData = this.form.value;
      // null이나 빈 문자열 처리
      Object.keys(formData).forEach(key => {
        if (formData[key] === '' || formData[key] === null) {
          const column = this.data.columns.find((c) => c.name === key);
          if (column?.nullable) {
            formData[key] = null;
          }
        }
      });
      this.dialogRef.close(formData);
    }
  }
}
