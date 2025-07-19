import { CommonModule } from '@angular/common';
import { Component, inject, type OnInit } from '@angular/core';
import {
  FormBuilder,
  type FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import {
  MatPaginatorIntl,
  MatPaginatorModule,
  type PageEvent,
} from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  AdminService,
  type TableData,
  type TableInfo,
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
    MatDatepickerModule,
    MatTimepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'ko-KR' },
    {
      provide: MatPaginatorIntl,
      useFactory: () => {
        const intl = new MatPaginatorIntl();
        intl.itemsPerPageLabel = '';
        intl.nextPageLabel = '';
        intl.previousPageLabel = '';
        intl.firstPageLabel = '';
        intl.lastPageLabel = '';
        intl.getRangeLabel = (
          page: number,
          pageSize: number,
          length: number
        ) => {
          if (length === 0 || pageSize === 0) {
            return `0 / ${length}`;
          }
          const startIndex = page * pageSize;
          const endIndex =
            startIndex < length
              ? Math.min(startIndex + pageSize, length)
              : startIndex + pageSize;
          return `${startIndex + 1} - ${endIndex} / ${length}`;
        };
        return intl;
      },
    },
  ],
  templateUrl: './database.component.html',
})
export class DatabaseComponent implements OnInit {
  private adminService = inject(AdminService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

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
    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;',
    });
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
          duration: 4000,
          panelClass: ['custom-snackbar'],
        });
      })
      .catch(err => {
        console.error('복사 실패:', err);
        this.snackBar.open('복사에 실패했습니다', '닫기', {
          duration: 4000,
          panelClass: ['custom-snackbar', 'error-snackbar'],
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
            duration: 5000,
            panelClass: ['custom-snackbar', 'success-snackbar'],
          });
          this.loadTableData();
        }
      },
      error: error => {
        console.error('데이터 추가 실패:', error);
        this.snackBar.open('데이터 추가에 실패했습니다', '닫기', {
          duration: 5000,
          panelClass: ['custom-snackbar', 'error-snackbar'],
        });
      },
    });
  }

  private updateRow(
    originalRow: Record<string, unknown>,
    newData: Record<string, unknown>
  ) {
    if (!this.selectedTable) return;

    const primaryKeys = this.getPrimaryKeys();
    const whereClause: Record<string, unknown> = {};

    primaryKeys.forEach(key => {
      whereClause[key] = originalRow[key];
    });

    this.adminService
      .updateTableRow(this.selectedTable.name, newData, whereClause)
      .subscribe({
        next: response => {
          if (response.success) {
            this.snackBar.open('데이터가 수정되었습니다', '닫기', {
              duration: 5000,
              panelClass: ['custom-snackbar', 'success-snackbar'],
            });
            this.loadTableData();
          }
        },
        error: error => {
          console.error('데이터 수정 실패:', error);
          this.snackBar.open('데이터 수정에 실패했습니다', '닫기', {
            duration: 5000,
            panelClass: ['custom-snackbar', 'error-snackbar'],
          });
        },
      });
  }

  private deleteRow(whereClause: Record<string, unknown>) {
    if (!this.selectedTable) return;

    this.adminService
      .deleteTableRow(this.selectedTable.name, whereClause)
      .subscribe({
        next: response => {
          if (response.success) {
            this.snackBar.open('데이터가 삭제되었습니다', '닫기', {
              duration: 5000,
              panelClass: ['custom-snackbar', 'success-snackbar'],
            });
            this.loadTableData();
          }
        },
        error: error => {
          console.error('데이터 삭제 실패:', error);
          this.snackBar.open('데이터 삭제에 실패했습니다', '닫기', {
            duration: 5000,
            panelClass: ['custom-snackbar', 'error-snackbar'],
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
    MatIconModule,
    MatSelectModule,
    MatDatepickerModule,
    MatTimepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
  ],
  providers: [{ provide: MAT_DATE_LOCALE, useValue: 'ko-KR' }],
  templateUrl: './database-dialog.component.html',
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

    this.data.columns.forEach(column => {
      const value =
        this.data.mode === 'edit' && this.data.row
          ? this.data.row[column.name]
          : column.default || '';

      if (
        column.type.includes('datetime') ||
        column.type.includes('timestamp')
      ) {
        // For datetime fields, create separate date and time controls
        const dateValue = value ? new Date(value as string) : null;
        formControls[`${column.name}_date`] = [dateValue];
        formControls[`${column.name}_time`] = [dateValue];
        // Keep the original control for backward compatibility
        formControls[column.name] = [value];
      } else {
        formControls[column.name] = [value];
      }
    });

    return this.fb.group(formControls);
  }

  isReadonly(column: { key?: string; extra?: string }): boolean {
    // Primary key나 auto increment 컬럼은 편집 모드에서 읽기 전용
    return (
      this.data.mode === 'edit' &&
      (column.key === 'PRI' || column.extra === 'auto_increment')
    );
  }

  getColumnIcon(type: string): string {
    if (
      type.includes('int') ||
      type.includes('decimal') ||
      type.includes('float')
    ) {
      return 'numbers';
    } else if (type.includes('varchar') || type.includes('char')) {
      return 'text_fields';
    } else if (type.includes('text')) {
      return 'subject';
    } else if (type.includes('datetime') || type.includes('timestamp')) {
      return 'schedule';
    } else if (type.includes('date')) {
      return 'calendar_today';
    } else if (type.includes('time')) {
      return 'access_time';
    } else if (type.includes('boolean') || type.includes('tinyint(1)')) {
      return 'toggle_on';
    }
    return 'data_object';
  }

  getKeyLabel(key: string): string {
    switch (key) {
      case 'PRI':
        return 'Primary';
      case 'UNI':
        return 'Unique';
      case 'MUL':
        return 'Index';
      default:
        return key;
    }
  }

  getFieldLabel(column: {
    name: string;
    type: string;
    nullable: boolean;
  }): string {
    return `${column.name} (${column.type})`;
  }

  getPlaceholder(column: {
    name: string;
    type: string;
    nullable: boolean;
  }): string {
    if (column.type.includes('int')) {
      return '숫자를 입력하세요';
    } else if (
      column.type.includes('varchar') ||
      column.type.includes('char')
    ) {
      return '텍스트를 입력하세요';
    } else if (column.type.includes('text')) {
      return '긴 텍스트를 입력하세요';
    } else if (
      column.type.includes('datetime') ||
      column.type.includes('timestamp')
    ) {
      return 'YYYY-MM-DD HH:MM:SS';
    } else if (column.type.includes('date')) {
      return 'YYYY-MM-DD';
    } else if (column.type.includes('time')) {
      return 'HH:MM:SS';
    }
    return column.nullable ? '값을 입력하세요 (선택사항)' : '값을 입력하세요';
  }

  getMaxLength(type: string): number | null {
    const match = type.match(/varchar\((\d+)\)/);
    return match ? parseInt(match[1], 10) : null;
  }

  getNumberStep(type: string): string {
    if (type.includes('decimal') || type.includes('float')) {
      return '0.01';
    }
    return '1';
  }

  isSenderColumn(column: {
    name: string;
    type: string;
    nullable: boolean;
  }): boolean {
    return column.name === 'sender';
  }

  save() {
    if (this.form.valid) {
      const formData = this.form.value;
      const finalData: Record<string, unknown> = {};

      // Process each column
      this.data.columns.forEach(column => {
        const key = column.name;

        if (
          column.type.includes('datetime') ||
          column.type.includes('timestamp')
        ) {
          // Combine date and time for datetime fields
          const dateValue = formData[`${key}_date`];
          const timeValue = formData[`${key}_time`];

          if (dateValue && timeValue) {
            const combinedDateTime = new Date(dateValue);
            const timeDate = new Date(timeValue);
            combinedDateTime.setHours(timeDate.getHours());
            combinedDateTime.setMinutes(timeDate.getMinutes());
            combinedDateTime.setSeconds(timeDate.getSeconds());
            finalData[key] = combinedDateTime
              .toISOString()
              .slice(0, 19)
              .replace('T', ' ');
          } else if (dateValue) {
            // If only date is provided, set time to 00:00:00
            const dateOnly = new Date(dateValue);
            finalData[key] = `${dateOnly.toISOString().slice(0, 10)} 00:00:00`;
          } else {
            finalData[key] = column.nullable ? null : '';
          }
        } else {
          // Handle other field types
          const value = formData[key];

          if (value === '' || value === null) {
            finalData[key] = column.nullable ? null : '';
          } else {
            // Type conversion for numbers
            if (column.type.includes('int')) {
              finalData[key] = parseInt(value, 10);
            } else if (
              column.type.includes('decimal') ||
              column.type.includes('float')
            ) {
              finalData[key] = parseFloat(value);
            } else {
              finalData[key] = value;
            }
          }
        }
      });

      this.dialogRef.close(finalData);
    }
  }
}
