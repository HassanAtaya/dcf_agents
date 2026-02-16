import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Role, RoleDto } from '../models/role.model';
import { Permission } from '../models/permission.model';
import { AppUser, UserDto } from '../models/user.model';
import { AiSettings, DcfStartRequest, DcfStartResponse, DcfStatusResponse } from '../models/ai.model';
import { DcfLog, DcfLogStats } from '../models/dcf-log.model';
import { AuthUser } from '../models/auth.model';
import { PageResponse, PageRequestParams } from '../models/page.model';
import { CacheService } from './cache.service';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private javaApi = environment.javaApiUrl + 'api/';
  private pythonApi = environment.pythonApiUrl;

  constructor(
    private http: HttpClient,
    private cache: CacheService
  ) {}

  private buildParams(params: PageRequestParams): HttpParams {
    let p = new HttpParams();
    if (params.page != null) p = p.set('page', String(params.page));
    if (params.size != null) p = p.set('size', String(params.size));
    if (params.sort != null) p = p.set('sort', params.sort);
     if (params.search != null && params.search !== '') p = p.set('search', params.search);
    return p;
  }

  // ===== Auth / Profile =====
  getMe(): Observable<AuthUser> { return this.http.get<AuthUser>(this.javaApi + 'auth/me'); }
  updateProfile(data: unknown): Observable<unknown> { return this.http.put(this.javaApi + 'auth/profile', data); }

  // ===== Permissions (paginated + cached list for dropdowns) =====
  getPermissions(params?: PageRequestParams): Observable<PageResponse<Permission>> {
    const obs = this.http.get<PageResponse<Permission>>(this.javaApi + 'permissions', {
      params: params ? this.buildParams(params) : undefined
    });
    return obs;
  }
  getPermissionsAll(): Observable<Permission[]> {
    const key = 'permissions/all';
    const cached = this.cache.get<Permission[]>(key);
    if (cached) return of(cached);
    return this.http.get<Permission[]>(this.javaApi + 'permissions/all').pipe(
      tap(data => this.cache.set(key, data))
    );
  }
  createPermission(data: Permission): Observable<Permission> {
    return this.http.post<Permission>(this.javaApi + 'permissions', data).pipe(
      tap(() => this.cache.invalidate('permissions'))
    );
  }
  updatePermission(id: number, data: Permission): Observable<Permission> {
    return this.http.put<Permission>(this.javaApi + 'permissions/' + id, data).pipe(
      tap(() => this.cache.invalidate('permissions'))
    );
  }
  deletePermission(id: number): Observable<void> {
    return this.http.delete<void>(this.javaApi + 'permissions/' + id).pipe(
      tap(() => this.cache.invalidate('permissions'))
    );
  }

  // ===== Roles =====
  getRoles(params?: PageRequestParams): Observable<PageResponse<Role>> {
    return this.http.get<PageResponse<Role>>(this.javaApi + 'roles', {
      params: params ? this.buildParams(params) : undefined
    });
  }
  getRolesAll(): Observable<Role[]> {
    const key = 'roles/all';
    const cached = this.cache.get<Role[]>(key);
    if (cached) return of(cached);
    return this.http.get<Role[]>(this.javaApi + 'roles/all').pipe(
      tap(data => this.cache.set(key, data))
    );
  }
  createRole(dto: RoleDto): Observable<Role> {
    return this.http.post<Role>(this.javaApi + 'roles', dto).pipe(
      tap(() => this.cache.invalidate('roles/all'))
    );
  }
  updateRole(id: number, dto: RoleDto): Observable<Role> {
    return this.http.put<Role>(this.javaApi + 'roles/' + id, dto).pipe(
      tap(() => this.cache.invalidate('roles/all'))
    );
  }
  deleteRole(id: number): Observable<void> {
    return this.http.delete<void>(this.javaApi + 'roles/' + id).pipe(
      tap(() => this.cache.invalidate('roles/all'))
    );
  }

  // ===== Users =====
  getUsers(params?: PageRequestParams): Observable<PageResponse<AppUser>> {
    return this.http.get<PageResponse<AppUser>>(this.javaApi + 'users', {
      params: params ? this.buildParams(params) : undefined
    });
  }
  createUser(dto: UserDto): Observable<AppUser> { return this.http.post<AppUser>(this.javaApi + 'users', dto); }
  updateUser(id: number, dto: UserDto): Observable<AppUser> { return this.http.put<AppUser>(this.javaApi + 'users/' + id, dto); }
  deleteUser(id: number): Observable<void> { return this.http.delete<void>(this.javaApi + 'users/' + id); }

  // ===== Settings =====
  getSettings(): Observable<AiSettings[]> { return this.http.get<AiSettings[]>(this.javaApi + 'settings'); }
  getCurrentSettings(): Observable<AiSettings> {
    const key = 'settings/current';
    const cached = this.cache.get<AiSettings>(key);
    if (cached) return of(cached);
    return this.http.get<AiSettings>(this.javaApi + 'settings/current').pipe(
      tap(data => this.cache.set(key, data))
    );
  }
  updateSettings(id: number, data: Partial<AiSettings>): Observable<AiSettings> {
    return this.http.put<AiSettings>(this.javaApi + 'settings/' + id, data).pipe(
      tap(() => this.cache.invalidate('settings/current'))
    );
  }

  // ===== DCF (Python) =====
  startDcf(data: DcfStartRequest): Observable<DcfStartResponse> {
    return this.http.post<DcfStartResponse>(this.pythonApi + 'api/dcf/start', data);
  }
  getDcfStatus(jobId: string): Observable<DcfStatusResponse> {
    return this.http.get<DcfStatusResponse>(this.pythonApi + 'api/dcf/status/' + jobId);
  }
  cancelDcf(jobId: string): Observable<DcfStatusResponse> {
    return this.http.post<DcfStatusResponse>(this.pythonApi + 'api/dcf/cancel/' + jobId, {});
  }
  getDcfDownloadUrl(jobId: string): string {
    return this.pythonApi + 'api/dcf/download/' + jobId;
  }

  // ===== KPI / DCF Logs (paginated + stats) =====
  getDcfLogsStats(): Observable<DcfLogStats> {
    return this.http.get<DcfLogStats>(this.javaApi + 'dcf-logs/stats');
  }
  getDcfLogs(params?: PageRequestParams): Observable<PageResponse<DcfLog>> {
    return this.http.get<PageResponse<DcfLog>>(this.javaApi + 'dcf-logs', {
      params: params ? this.buildParams(params) : undefined
    });
  }
  createDcfLog(data: Partial<DcfLog>): Observable<DcfLog> { return this.http.post<DcfLog>(this.javaApi + 'dcf-logs', data); }
}
