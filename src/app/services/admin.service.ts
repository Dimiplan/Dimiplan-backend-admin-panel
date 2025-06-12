import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SystemStatus {
  uptime: number;
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
  platform: string;
  nodeVersion: string;
  environment: string;
  timestamp: string;
}

export interface LogFile {
  name: string;
  size: number;
  modified: Date;
  path: string;
}

export interface LogContent {
  filename: string;
  totalLines: number;
  displayedLines: number;
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
    default: any;
  }>;
  rows: any[];
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
  brief: string;
  details: string;
  returns: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private baseUrl = 'https://localhost:3000/api/admin';

  constructor(private http: HttpClient) {}

  getSystemStatus(): Observable<{ success: boolean; data: SystemStatus }> {
    return this.http.get<{ success: boolean; data: SystemStatus }>(`${this.baseUrl}/system-status`);
  }

  getLogFiles(): Observable<{ success: boolean; data: LogFile[] }> {
    return this.http.get<{ success: boolean; data: LogFile[] }>(`${this.baseUrl}/logs`);
  }

  getLogContent(filename: string, lines?: number): Observable<{ success: boolean; data: LogContent }> {
    const params = lines ? { lines: lines.toString() } : {};
    return this.http.get<{ success: boolean; data: LogContent }>(`${this.baseUrl}/logs/${filename}`, { params });
  }

  getDatabaseTables(): Observable<{ success: boolean; data: TableInfo[] }> {
    return this.http.get<{ success: boolean; data: TableInfo[] }>(`${this.baseUrl}/database/tables`);
  }

  getTableData(tableName: string, page = 1, limit = 50): Observable<{ success: boolean; data: TableData }> {
    const params = { page: page.toString(), limit: limit.toString() };
    return this.http.get<{ success: boolean; data: TableData }>(`${this.baseUrl}/database/tables/${tableName}`, { params });
  }

  getUserStats(): Observable<{ success: boolean; data: UserStats }> {
    return this.http.get<{ success: boolean; data: UserStats }>(`${this.baseUrl}/stats/users`);
  }

  getApiDocs(): Observable<{ success: boolean; data: ApiDoc[] }> {
    return this.http.get<{ success: boolean; data: ApiDoc[] }>(`${this.baseUrl}/docs`);
  }
}