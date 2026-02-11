import { Component } from '@angular/core';
import { TranslateService } from '../../../services/translate.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `<footer class="app-footer">{{ ts.t('footer.text') }}</footer>`,
  styles: [`
    .app-footer {
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--color-header-bg);
      color: rgba(255,255,255,0.7);
      font-size: 0.85rem;
      font-weight: 500;
    }
  `]
})
export class FooterComponent {
  constructor(public ts: TranslateService) {}
}
