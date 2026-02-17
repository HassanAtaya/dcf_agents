import { Component, OnInit, ViewChild, ElementRef, signal, AfterViewInit, OnDestroy } from '@angular/core';
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
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { UserStateService } from '../../services/user-state.service';

const PAGE_SIZE = 15;

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, ButtonModule, DialogModule,
    InputTextModule, DropdownModule, ConfirmDialogModule
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('userUsernameInput') userUsernameInput!: ElementRef<HTMLInputElement>;
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;

  allUsers = signal<AppUser[]>([]);
  loadingMore = signal(false);
  initialLoading = signal(true);

  private currentPage = 0;
  totalElements = 0;
  private scrollListener: (() => void) | null = null;

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
  searchTerm = '';
  private searchSubject = new Subject<string>();

  constructor(
    private api: ApiService,
    public auth: AuthService,
    private confirmService: ConfirmationService,
    private messageService: MessageService,
    public ts: TranslateService,
    private userState: UserStateService
  ) {}

  onDialogShow(): void {
    setTimeout(() => this.userUsernameInput?.nativeElement?.focus(), 100);
  }

  ngOnInit(): void {
    this.api.getRolesAll().subscribe(data => this.roles = data);
    this.loadPage(0);

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => this.resetAndLoad());
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.searchInput?.nativeElement?.focus(), 100);
    setTimeout(() => this.attachScrollListener(), 200);
  }

  ngOnDestroy(): void {
    this.detachScrollListener();
    this.searchSubject.complete();
  }

  get hasMore(): boolean {
    return this.allUsers().length < this.totalElements;
  }

  private attachScrollListener(): void {
    const el = this.scrollContainer?.nativeElement;
    if (!el) return;
    const getScrollEl = (): Element | null =>
      el.querySelector('.p-datatable-wrapper') ?? el;
    const bind = (target: Element) => {
      this.scrollListener = () => {
        const threshold = 50;
        const sh = target instanceof HTMLElement ? target.scrollHeight : 0;
        const st = target instanceof HTMLElement ? target.scrollTop : 0;
        const ch = target instanceof HTMLElement ? target.clientHeight : 0;
        const atBottom = sh - st - ch < threshold;
        if (atBottom && this.hasMore && !this.loadingMore()) {
          this.loadPage(this.currentPage + 1);
        }
      };
      target.addEventListener('scroll', this.scrollListener, { passive: true });
    };
    const scrollEl = getScrollEl();
    if (scrollEl) bind(scrollEl);
    else setTimeout(() => {
      const s = getScrollEl();
      if (s) bind(s);
    }, 300);
  }

  private detachScrollListener(): void {
    const el = this.scrollContainer?.nativeElement;
    if (!el || !this.scrollListener) return;
    const scrollEl = el.querySelector('.p-datatable-wrapper') ?? el;
    scrollEl.removeEventListener('scroll', this.scrollListener);
  }

  private loadPage(page: number): void {
    this.loadingMore.set(true);
    this.api.getUsers({ page, size: PAGE_SIZE, sort: 'id,asc', search: this.searchTerm || undefined }).subscribe({
      next: (p) => {
        this.currentPage = page;
        this.totalElements = p.totalElements;
        if (page === 0) {
          this.allUsers.set(p.content);
        } else {
          this.allUsers.set([...this.allUsers(), ...p.content]);
        }
        this.loadingMore.set(false);
        this.initialLoading.set(false);
      },
      error: () => {
        this.loadingMore.set(false);
        this.initialLoading.set(false);
      }
    });
  }

  private resetAndLoad(): void {
    this.currentPage = 0;
    this.totalElements = 0;
    this.allUsers.set([]);
    this.initialLoading.set(true);
    this.loadPage(0);
  }

  onSearchChange(): void {
    this.searchSubject.next(this.searchTerm);
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
    const isEdit = this.editMode && this.selectedUser;
    const obs = isEdit
      ? this.api.updateUser(this.selectedUser!.id!, this.form)
      : this.api.createUser(this.form);

    obs.subscribe({
      next: (savedUser) => {
        // Keep a copy of the last edited/created user in a shared signal
        // so that other components (like Roles) can react to it.
        this.userState.setLastEditedUser(savedUser as AppUser);

        this.showDialog = false;
        this.resetAndLoad();
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
            this.resetAndLoad();
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
