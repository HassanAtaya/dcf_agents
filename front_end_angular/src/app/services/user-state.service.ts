import { Injectable } from '@angular/core';
import { signal } from '@angular/core';
import type { AppUser } from '../models/user.model';

const STORAGE_KEY_LAST_EDITED_USER = 'app_lastEditedUser';

@Injectable({ providedIn: 'root' })
export class UserStateService {
  // Holds the last user that was created or edited
  private readonly lastEditedUserSignal = signal<AppUser | null>(UserStateService.loadFromStorage());

  // Expose as read-only signal for consumers
  readonly lastEditedUser = this.lastEditedUserSignal.asReadonly();

  setLastEditedUser(user: AppUser | null): void {
    this.lastEditedUserSignal.set(user);
    UserStateService.saveToStorage(user);
  }

  // Static helpers to interact with localStorage safely
  private static loadFromStorage(): AppUser | null {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY_LAST_EDITED_USER);
      if (!raw) return null;
      return JSON.parse(raw) as AppUser;
    } catch {
      return null;
    }
  }

  private static saveToStorage(user: AppUser | null): void {
    try {
      if (!user) {
        window.localStorage.removeItem(STORAGE_KEY_LAST_EDITED_USER);
      } else {
        window.localStorage.setItem(STORAGE_KEY_LAST_EDITED_USER, JSON.stringify(user));
      }
    } catch {
      // Ignore storage errors (e.g., disabled storage)
    }
  }
}

