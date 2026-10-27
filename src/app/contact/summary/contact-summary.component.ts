import { Component, input, output } from '@angular/core';

import { CONTACT_FIELDS, ContactField, ContactValues } from '../../core/contact-dialogue.service';
import { I18nKey } from '../../i18n/i18n.types';
import { TranslatePipe } from '../../i18n/translate.pipe';

/** The answers read back before sending, each with an "edit" link back to its question. */
@Component({
  selector: 'app-contact-summary',
  imports: [TranslatePipe],
  template: `
    <dl class="summary">
      @for (field of fields; track field) {
        <dt class="summary__label">
          {{ labelKey(field) | t }}
          <button type="button" class="summary__edit" (click)="edit.emit(field)">
            {{ 'contact.controls.edit' | t }}
            <span class="visually-hidden">{{ labelKey(field) | t }}</span>
          </button>
        </dt>
        <dd class="summary__value">{{ values()[field] }}</dd>
      }
    </dl>
  `,
  styleUrl: './contact-summary.component.scss',
})
export class ContactSummaryComponent {
  readonly values = input.required<ContactValues>();
  readonly edit = output<ContactField>();

  protected readonly fields = CONTACT_FIELDS;

  protected labelKey(field: ContactField): I18nKey {
    return `contact.fields.${field}`;
  }
}
