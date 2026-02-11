import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoaderService {
  private count = 0;
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  private setLoading(value: boolean): void {
    // Defer emission to next macrotask to avoid ExpressionChangedAfterItHasBeenCheckedError
    setTimeout(() => this.loadingSubject.next(value), 0);
  }

  show(): void {
    this.count++;
    if (this.count === 1) {
      this.setLoading(true);
    }
  }

  hide(): void {
    this.count = Math.max(0, this.count - 1);
    if (this.count === 0) {
      this.setLoading(false);
    }
  }
}

