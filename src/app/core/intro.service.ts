import { Injectable, signal } from '@angular/core';

/**
 * Whether the page's entrance may play. An intro screen (PRESS START) sets `introDone` to false
 * while it covers the page and back to true when it closes; the hero holds its entrance until then.
 */
@Injectable({ providedIn: 'root' })
export class IntroService {
  readonly introDone = signal(true);
}
