import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SystemStatus {
  uptime: number;
  totalmem: number;
  freemem: number;
  loadavg: number;
  platform: string;
  nodeVersion: string;
  environment: string;
  timestamp: string;
}

export interface AiUsage {
  total_credits: number;
  total_usage: number;
}

export interface LogFile {
  name: string;
  size: number;
  modified: Date;
  path: string;
}

export interface LogContent {
  filename: string;
  lines: number;
  content: string;
}

export interface TableInfo {
  name: string;
  rowCount: number;
}

export interface TableData {
  tableName: string;
  columns: Array<{
    name: string;
    type: string;
    nullable: boolean;
    key: string;
    default: unknown;
  }>;
  rows: Record<string, unknown>[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  recentUsers: Array<{
    id: number;
    email: string;
    created_at: string;
  }>;
}

export interface ApiDoc {
  file: string;
  method: string;
  path: string;
  name: string;
  params?: Array<{
    name: string;
    type: string;
    optional: string;
    description: string;
  }>;
  routeParams?: Array<{
    name: string;
    type: string;
    description: string;
  }>;
  returns?: Array<{
    type: {
      names: string[];
    };
    description: string;
  }>;
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private http = inject(HttpClient);

  private baseUrl = 'https://api-dev.dimiplan.com/api/admin';

  getSystemStatus(): Observable<{ success: boolean; data: SystemStatus }> {
    return this.http.get<{ success: boolean; data: SystemStatus }>(
      `${this.baseUrl}/system-status`
    );
  }

  getAiUsage(): Observable<{ success: boolean; data: AiUsage }> {
    return this.http.get<{ success: boolean; data: AiUsage }>(
      `${this.baseUrl}/ai-usage`
    );
  }

  getLogFiles(): Observable<{ success: boolean; data: LogFile[] }> {
    return this.http.get<{ success: boolean; data: LogFile[] }>(
      `${this.baseUrl}/logs`
    );
  }

  getLogContent(
    filename: string,
    lines?: number
  ): Observable<{ success: boolean; data: LogContent }> {
    const params: Record<string, string> = {};
    if (lines !== undefined) {
      params['lines'] = lines.toString();
    }
    return this.http.get<{ success: boolean; data: LogContent }>(
      `${this.baseUrl}/logs/${filename}`,
      Object.keys(params).length > 0 ? { params } : {}
    );
  }

  getDatabaseTables(): Observable<{ success: boolean; data: TableInfo[] }> {
    return this.http.get<{ success: boolean; data: TableInfo[] }>(
      `${this.baseUrl}/database/tables`
    );
  }

  getTableData(
    tableName: string,
    page = 1,
    limit = 50
  ): Observable<{ success: boolean; data: TableData }> {
    const params = { page: page.toString(), limit: limit.toString() };
    return this.http.get<{ success: boolean; data: TableData }>(
      `${this.baseUrl}/database/tables/${tableName}`,
      { params }
    );
  }

  getUserStats(): Observable<{ success: boolean; data: UserStats }> {
    return this.http.get<{ success: boolean; data: UserStats }>(
      `${this.baseUrl}/stats/users`
    );
  }

  getApiDocs(): Observable<{ success: boolean; data: ApiDoc[] }> {
    return this.http.get<{ success: boolean; data: ApiDoc[] }>(
      `${this.baseUrl}/docs`
    );
  }

  regenerateApiDocs(): Observable<{
    success: boolean;
    message: string;
    timestamp: string;
  }> {
    return this.http.post<{
      success: boolean;
      message: string;
      timestamp: string;
    }>(`${this.baseUrl}/docs/regenerate`, {});
  }

  // DB 관리 메서드들
  addTableRow(
    tableName: string,
    data: Record<string, unknown>
  ): Observable<{ success: boolean; data: { insertId: number } }> {
    return this.http.post<{ success: boolean; data: { insertId: number } }>(
      `${this.baseUrl}/database/tables/${tableName}`,
      { data }
    );
  }

  updateTableRow(
    tableName: string,
    data: Record<string, unknown>,
    where: Record<string, unknown>
  ): Observable<{ success: boolean; data: { affectedRows: number } }> {
    return this.http.put<{ success: boolean; data: { affectedRows: number } }>(
      `${this.baseUrl}/database/tables/${tableName}`,
      { data, where }
    );
  }

  deleteTableRow(
    tableName: string,
    where: Record<string, unknown>
  ): Observable<{ success: boolean; data: { affectedRows: number } }> {
    return this.http.delete<{
      success: boolean;
      data: { affectedRows: number };
    }>(`${this.baseUrl}/database/tables/${tableName}`, { body: { where } });
  }

  // 로그 관리 메서드들
  deleteLogFile(
    filename: string
  ): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.baseUrl}/logs/${filename}`
    );
  }

  clearAllLogs(): Observable<{
    success: boolean;
    message: string;
    data: { clearedFiles: number };
  }> {
    return this.http.post<{
      success: boolean;
      message: string;
      data: { clearedFiles: number };
    }>(`${this.baseUrl}/logs/clear`, {});
  }
}
