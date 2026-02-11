import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
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
export class RolesComponent implements OnInit {
  @ViewChild('roleNameInput') roleNameInput!: ElementRef<HTMLInputElement>;

  roles: Role[] = [];
  permissions: Permission[] = [];
  showDialog = false;
  editMode = false;
  selectedRole: Role | null = null;
  roleName = '';
  selectedPermissionIds: number[] = [];

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

  ngOnInit(): void { this.loadData(); }

  loadData(): void {
    this.api.getRoles().subscribe(data => this.roles = data);
    this.api.getPermissions().subscribe(data => this.permissions = data);
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
        this.loadData();
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
            this.loadData();
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
