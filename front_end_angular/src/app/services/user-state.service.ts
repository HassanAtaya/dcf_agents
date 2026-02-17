import { Injectable } from '@angular/core';
import { signal } from '@angular/core';
import type { AppUser } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserStateService {
  // Holds the last user that was created or edited
  private readonly lastEditedUserSignal = signal<AppUser | null>(null);

  // Expose as read-only signal for consumers
  readonly lastEditedUser = this.lastEditedUserSignal.asReadonly();

  setLastEditedUser(user: AppUser | null): void {
    this.lastEditedUserSignal.set(user);
  }
}

