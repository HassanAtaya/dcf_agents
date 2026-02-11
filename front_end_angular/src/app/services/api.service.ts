import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Role, RoleDto } from '../models/role.model';
import { Permission } from '../models/permission.model';
import { AppUser, UserDto } from '../models/user.model';
import { AiSettings, DcfStartRequest, DcfStartResponse, DcfStatusResponse } from '../models/ai.model';
import { DcfLog } from '../models/dcf-log.model';
import { AuthUser } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private javaApi = environment.javaApiUrl + 'api/';
  private pythonApi = environment.pythonApiUrl;

  constructor(private http: HttpClient) {}

  // ===== Auth / Profile =====
  getMe(): Observable<AuthUser> { return this.http.get<AuthUser>(this.javaApi + 'auth/me'); }
  updateProfile(data: any): Observable<any> { return this.http.put(this.javaApi + 'auth/profile', data); }

  // ===== Permissions =====
  getPermissions(): Observable<Permission[]> { return this.http.get<Permission[]>(this.javaApi + 'permissions'); }
  createPermission(data: Permission): Observable<Permission> { return this.http.post<Permission>(this.javaApi + 'permissions', data); }
  updatePermission(id: number, data: Permission): Observable<Permission> { return this.http.put<Permission>(this.javaApi + 'permissions/' + id, data); }
  deletePermission(id: number): Observable<void> { return this.http.delete<void>(this.javaApi + 'permissions/' + id); }

  // ===== Roles =====
  getRoles(): Observable<Role[]> { return this.http.get<Role[]>(this.javaApi + 'roles'); }
  createRole(dto: RoleDto): Observable<Role> { return this.http.post<Role>(this.javaApi + 'roles', dto); }
  updateRole(id: number, dto: RoleDto): Observable<Role> { return this.http.put<Role>(this.javaApi + 'roles/' + id, dto); }
  deleteRole(id: number): Observable<void> { return this.http.delete<void>(this.javaApi + 'roles/' + id); }

  // ===== Users =====
  getUsers(): Observable<AppUser[]> { return this.http.get<AppUser[]>(this.javaApi + 'users'); }
  createUser(dto: UserDto): Observable<AppUser> { return this.http.post<AppUser>(this.javaApi + 'users', dto); }
  updateUser(id: number, dto: UserDto): Observable<AppUser> { return this.http.put<AppUser>(this.javaApi + 'users/' + id, dto); }
  deleteUser(id: number): Observable<void> { return this.http.delete<void>(this.javaApi + 'users/' + id); }

  // ===== Settings =====
  getSettings(): Observable<AiSettings[]> { return this.http.get<AiSettings[]>(this.javaApi + 'settings'); }
  getCurrentSettings(): Observable<AiSettings> { return this.http.get<AiSettings>(this.javaApi + 'settings/current'); }
  updateSettings(id: number, data: Partial<AiSettings>): Observable<AiSettings> { return this.http.put<AiSettings>(this.javaApi + 'settings/' + id, data); }

  // ===== DCF (Python) =====
  startDcf(data: DcfStartRequest): Observable<DcfStartResponse> {
    return this.http.post<DcfStartResponse>(this.pythonApi + 'api/dcf/start', data);
  }
  getDcfStatus(jobId: string): Observable<DcfStatusResponse> {
    return this.http.get<DcfStatusResponse>(this.pythonApi + 'api/dcf/status/' + jobId);
  }
  getDcfDownloadUrl(jobId: string): string {
    return this.pythonApi + 'api/dcf/download/' + jobId;
  }

  // ===== KPI / DCF Logs =====
  getDcfLogs(): Observable<DcfLog[]> { return this.http.get<DcfLog[]>(this.javaApi + 'dcf-logs'); }
  createDcfLog(data: Partial<DcfLog>): Observable<DcfLog> { return this.http.post<DcfLog>(this.javaApi + 'dcf-logs', data); }
}
