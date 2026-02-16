import { Component, OnInit, ViewChild, ElementRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { TranslateService } from '../../services/translate.service';
import { Permission } from '../../models/permission.model';

@Component({
  selector: 'app-permissions',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, ButtonModule, DialogModule, InputTextModule, ConfirmDialogModule],
  templateUrl: './permissions.component.html',
  styleUrl: './permissions.component.scss'
})
export class PermissionsComponent implements OnInit {
  @ViewChild('permNameInput') permNameInput!: ElementRef<HTMLInputElement>;

  private contentSignal = signal<Permission[]>([]);
  private totalRecordsSignal = signal(0);
  private loadingSignal = signal(false);

  permissions = this.contentSignal.asReadonly();
  totalRecords = this.totalRecordsSignal.asReadonly();
  loading = this.loadingSignal.asReadonly();

  showDialog = false;
  editMode = false;
  selectedPerm: Permission | null = null;
  permName = '';

  constructor(
    private api: ApiService,
    public auth: AuthService,
    private confirmService: ConfirmationService,
    private messageService: MessageService,
    public ts: TranslateService
  ) {}

  onDialogShow(): void {
    setTimeout(() => this.permNameInput?.nativeElement?.focus(), 100);
  }

  ngOnInit(): void {
    // Initial load is done by table's first lazy load
  }

  onLazyLoad(event: TableLazyLoadEvent): void {
    this.loadingSignal.set(true);
    const page = event.first ?? 0;
    const size = event.rows ?? 20;
    const sort = event.sortField
      ? `${event.sortField},${event.sortOrder === 1 ? 'asc' : 'desc'}`
      : undefined;
    this.api.getPermissions({ page: Math.floor(page / size), size, sort }).subscribe({
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
    this.selectedPerm = null;
    this.permName = '';
    this.showDialog = true;
  }

  openEdit(perm: Permission): void {
    this.editMode = true;
    this.selectedPerm = perm;
    this.permName = perm.name;
    this.showDialog = true;
  }

  save(): void {
    const data = { name: this.permName } as Permission;
    const obs = this.editMode && this.selectedPerm
      ? this.api.updatePermission(this.selectedPerm.id, data)
      : this.api.createPermission(data);

    obs.subscribe({
      next: () => {
        this.showDialog = false;
        this.onLazyLoad({ first: 0, rows: 20 });
        this.messageService.add({ severity: 'success', summary: this.ts.t('common.success'), detail: this.ts.t('permissions.saved') });
      }
    });
  }

  confirmDelete(perm: Permission): void {
    this.confirmService.confirm({
      message: `${this.ts.t('permissions.confirm_delete')} "${perm.name}"?`,
      header: this.ts.t('common.confirm_delete'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.api.deletePermission(perm.id).subscribe({
          next: () => {
            this.onLazyLoad({ first: 0, rows: 20 });
            this.messageService.add({ severity: 'success', summary: this.ts.t('common.success'), detail: this.ts.t('permissions.deleted') });
          }
        });
      }
    });
  }
}
