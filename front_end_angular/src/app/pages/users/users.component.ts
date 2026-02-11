import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { TranslateService } from '../../services/translate.service';
import { AppUser, UserDto } from '../../models/user.model';
import { Role } from '../../models/role.model';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, ButtonModule, DialogModule, InputTextModule, DropdownModule, ConfirmDialogModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit {
  @ViewChild('userUsernameInput') userUsernameInput!: ElementRef<HTMLInputElement>;

  users: AppUser[] = [];
  roles: Role[] = [];
  showDialog = false;
  editMode = false;
  selectedUser: AppUser | null = null;

  languages = [
    { label: 'English', value: 'en' },
    { label: 'Français', value: 'fr' },
    { label: 'العربية', value: 'ar' }
  ];

  form: UserDto = { username: '', password: '', firstname: '', lastname: '', language: 'en', roleId: null };

  constructor(
    private api: ApiService,
    public auth: AuthService,
    private confirmService: ConfirmationService,
    private messageService: MessageService,
    public ts: TranslateService
  ) {}

  onDialogShow(): void {
    setTimeout(() => this.userUsernameInput?.nativeElement?.focus(), 100);
  }

  ngOnInit(): void { this.loadData(); }

  loadData(): void {
    this.api.getUsers().subscribe(data => this.users = data);
    this.api.getRoles().subscribe(data => this.roles = data);
  }

  openAdd(): void {
    this.editMode = false;
    this.selectedUser = null;
    this.form = { username: '', password: '', firstname: '', lastname: '', language: 'en', roleId: null };
    this.showDialog = true;
  }

  openEdit(user: AppUser): void {
    this.editMode = true;
    this.selectedUser = user;
    this.form = {
      username: user.username,
      password: '',
      firstname: user.firstname,
      lastname: user.lastname,
      language: user.language || 'en',
      roleId: user.roles && user.roles.length > 0 ? user.roles[0].id! : null
    };
    this.showDialog = true;
  }

  save(): void {
    const obs = this.editMode && this.selectedUser
      ? this.api.updateUser(this.selectedUser.id!, this.form)
      : this.api.createUser(this.form);

    obs.subscribe({
      next: () => {
        this.showDialog = false;
        this.loadData();
        this.messageService.add({ severity: 'success', summary: this.ts.t('common.success'), detail: this.ts.t('users.saved') });
      }
    });
  }

  confirmDelete(user: AppUser): void {
    this.confirmService.confirm({
      message: `${this.ts.t('users.confirm_delete')} "${user.username}"?`,
      header: this.ts.t('common.confirm_delete'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.api.deleteUser(user.id!).subscribe({
          next: () => {
            this.loadData();
            this.messageService.add({ severity: 'success', summary: this.ts.t('common.success'), detail: this.ts.t('users.deleted') });
          }
        });
      }
    });
  }

  isAdminUser(user: AppUser): boolean {
    return user.username?.toLowerCase() === 'admin';
  }

  getRoleName(user: AppUser): string {
    return user.roles?.map(r => r.name).join(', ') || 'N/A';
  }
}
