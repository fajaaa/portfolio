import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ToastService } from '../../core/toast.service';

/** Renders the ToastService queue; place once in the app shell. Announced politely. */
@Component({
  selector: 'app-toast-outlet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (toast of toasts.toasts(); track toast.id) {
      <div class="toast" animate.enter="toast--enter" animate.leave="toast--leave">
        <strong class="toast__title">{{ toast.title }}</strong>
        @if (toast.detail) {
          <span class="toast__detail">{{ toast.detail }}</span>
        }
      </div>
    }
  `,
  styleUrl: './toast-outlet.component.scss',
  host: {
    role: 'status',
    'aria-live': 'polite',
  },
})
export class ToastOutletComponent {
  protected readonly toasts = inject(ToastService);
}
