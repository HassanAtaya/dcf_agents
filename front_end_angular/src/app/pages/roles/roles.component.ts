import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { TranslateService } from '../../services/translate.service';
import { Role } from '../../models/role.model';
import { Permission } from '../../models/permission.model';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, ButtonModule, DialogModule, InputTextModule, MultiSelectModule, ConfirmDialogModule],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.scss'
})
export class RolesComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('roleNameInput') roleNameInput!: ElementRef<HTMLInputElement>;
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  private contentSignal = signal<Role[]>([]);
  private totalRecordsSignal = signal(0);
  private loadingSignal = signal(false);

  roles = this.contentSignal.asReadonly();
  totalRecords = this.totalRecordsSignal.asReadonly();
  loading = this.loadingSignal.asReadonly();

  permissions: Permission[] = [];
  showDialog = false;
  editMode = false;
  selectedRole: Role | null = null;
  roleName = '';
  selectedPermissionIds: number[] = [];
  searchTerm = '';
  private searchSubject = new Subject<string>();
  private tableRef: { first: number; rows: number; sortField?: string; sortOrder?: number } = { first: 0, rows: 20 };

  constructor(
    private api: ApiService,
    public auth: AuthService,
    private confirmService: ConfirmationService,
    private messageService: MessageService,
    public ts: TranslateService
  ) {}

  onDialogShow(): void {
    setTimeout(() => this.roleNameInput?.nativeElement?.focus(), 100);
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.searchInput?.nativeElement?.focus(), 100);
  }

  ngOnInit(): void {
    this.api.getPermissionsAll().subscribe(data => this.permissions = data);
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => this.reloadTable());
  }

  ngOnDestroy(): void {
    this.searchSubject.complete();
  }

  onSearchChange(): void {
    this.searchSubject.next(this.searchTerm);
  }

  private reloadTable(): void {
    const evt = { first: 0, rows: this.tableRef.rows ?? 20, sortField: this.tableRef.sortField, sortOrder: this.tableRef.sortOrder ?? 1 };
    this.tableRef = { ...evt };
    this.onLazyLoad(evt);
  }

  onLazyLoad(event: TableLazyLoadEvent): void {
    this.tableRef = { first: event.first ?? 0, rows: event.rows ?? 20, sortField: typeof event.sortField === 'string' ? event.sortField : undefined, sortOrder: event.sortOrder ?? 1 };
    this.loadingSignal.set(true);
    const page = event.first ?? 0;
    const size = event.rows ?? 20;
    const sort = event.sortField
      ? `${event.sortField},${event.sortOrder === 1 ? 'asc' : 'desc'}`
      : undefined;
    this.api.getRoles({ page: Math.floor(page / size), size, sort, search: this.searchTerm || undefined }).subscribe({
      next: (p) => {
        this.contentSignal.set(p.content);
        this.totalRecordsSignal.set(p.totalElements);
        this.loadingSignal.set(false);
      },
      error: () => this.loadingSignal.set(false)
    });
  }

  openAdd(): void {
    this.editMode = false;
    this.selectedRole = null;
    this.roleName = '';
    this.selectedPermissionIds = [];
    this.showDialog = true;
  }

  openEdit(role: Role): void {
    this.editMode = true;
    this.selectedRole = role;
    this.roleName = role.name;
    this.selectedPermissionIds = role.permissions.map(p => p.id);
    this.showDialog = true;
  }

  save(): void {
    const dto = { name: this.roleName, permissionIds: this.selectedPermissionIds };
    const obs = this.editMode && this.selectedRole
      ? this.api.updateRole(this.selectedRole.id!, dto)
      : this.api.createRole(dto);

    obs.subscribe({
      next: () => {
        this.showDialog = false;
        this.reloadTable();
        this.messageService.add({ severity: 'success', summary: this.ts.t('common.success'), detail: this.ts.t('roles.saved') });
      }
    });
  }

  confirmDelete(role: Role): void {
    this.confirmService.confirm({
      message: `${this.ts.t('roles.confirm_delete')} "${role.name}"?`,
      header: this.ts.t('common.confirm_delete'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.api.deleteRole(role.id!).subscribe({
          next: () => {
            this.reloadTable();
            this.messageService.add({ severity: 'success', summary: this.ts.t('common.success'), detail: this.ts.t('roles.deleted') });
          }
        });
      }
    });
  }

  isAdmin(role: Role): boolean {
    return role.name?.toUpperCase() === 'ADMIN';
  }
}
