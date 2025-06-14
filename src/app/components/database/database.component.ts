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
	templateUrl: './database.component.html'
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
