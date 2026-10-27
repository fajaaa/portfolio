import { Component } from '@angular/core';

import { I18nKey } from '../../i18n/i18n.types';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { PixelArtComponent, PixelSprite } from '../../ui/pixel-art/pixel-art.component';
import { DOWNLOAD_SPRITE } from '../../ui/pixel-art/sprites';
import { PixelButtonComponent } from '../../ui/pixel-button/pixel-button.component';
import { PixelPanelComponent } from '../../ui/pixel-panel/pixel-panel.component';
import { GITHUB_SPRITE, LINKEDIN_SPRITE, MAIL_SPRITE } from '../contact-sprites';

interface FastTravelLink {
  labelKey: I18nKey;
  value: string;
  href: string;
  icon: PixelSprite;
  external?: boolean;
  download?: boolean;
}

/** Always-visible quick links (email, LinkedIn, GitHub, CV) for visitors who skip the dialogue. */
@Component({
  selector: 'app-fast-travel',
  imports: [PixelArtComponent, PixelButtonComponent, PixelPanelComponent, TranslatePipe],
  templateUrl: './fast-travel.component.html',
  styleUrl: './fast-travel.component.scss',
})
export class FastTravelComponent {
  private readonly email = 'kenanfajic25@gmail.com';

  protected readonly links: FastTravelLink[] = [
    {
      labelKey: 'contact.links.email',
      value: this.email,
      href: `mailto:${this.email}`,
      icon: MAIL_SPRITE,
    },
    {
      labelKey: 'contact.links.linkedin',
      value: 'linkedin.com/in/kenan-fajic',
      href: 'https://www.linkedin.com/in/kenan-fajic?utm_source=share_via&utm_content=profile&utm_medium=member_android',
      icon: LINKEDIN_SPRITE,
      external: true,
    },
    {
      labelKey: 'contact.links.github',
      value: 'github.com/fajaaa',
      href: 'https://github.com/fajaaa',
      icon: GITHUB_SPRITE,
      external: true,
    },
    {
      labelKey: 'contact.links.cv',
      value: 'Kenan-CV.pdf',
      href: 'Kenan-CV.pdf',
      icon: DOWNLOAD_SPRITE,
      download: true,
    },
  ];
}
