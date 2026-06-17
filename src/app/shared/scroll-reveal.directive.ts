import {
  AfterViewInit,
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  Output,
  Renderer2,
  SimpleChanges,
  inject,
  numberAttribute,
} from '@angular/core';

import { ScrollAnimationService } from './scroll-animation.service';

export type ScrollRevealAnimationType = 'fade-up' | 'fade-left' | 'fade-right' | 'zoom-in';

@Directive({
  selector: '[scrollReveal]',
  standalone: true,
})
export class ScrollRevealDirective implements AfterViewInit, OnChanges, OnDestroy {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly ngZone = inject(NgZone);
  private readonly renderer = inject(Renderer2);
  private readonly scrollAnimation = inject(ScrollAnimationService);
  private readonly animationTypes = new Set<ScrollRevealAnimationType>([
    'fade-up',
    'fade-left',
    'fade-right',
    'zoom-in',
  ]);

  private animationClass = '';
  private hasInitializedView = false;
  private isVisible = false;
  private stopObserving: (() => void) | undefined;

  @Input() animationType: ScrollRevealAnimationType = 'fade-up';
  @Input({ transform: numberAttribute }) delay = 0;
  @Input({ transform: numberAttribute }) threshold = 0.2;
  @Output() revealed = new EventEmitter<void>();

  ngOnChanges(changes: SimpleChanges): void {
    this.applyHostState();

    if (changes['threshold'] && this.hasInitializedView && !this.isVisible) {
      this.observeElement();
    }
  }

  ngAfterViewInit(): void {
    this.hasInitializedView = true;
    this.applyHostState();
    this.observeElement();
  }

  ngOnDestroy(): void {
    this.stopObserving?.();
  }

  private observeElement(): void {
    this.stopObserving?.();

    const element = this.elementRef.nativeElement;

    if (this.scrollAnimation.hasAnimated(element)) {
      this.reveal();
      return;
    }

    this.stopObserving = this.ngZone.runOutsideAngular(() =>
      this.scrollAnimation.observe(element, this.threshold, () => {
        this.ngZone.run(() => this.reveal());
      }),
    );
  }

  private applyHostState(): void {
    const element = this.elementRef.nativeElement;
    const animationType = this.getAnimationType();
    const nextAnimationClass = `scroll-reveal--${animationType}`;

    this.renderer.addClass(element, 'scroll-reveal');

    if (this.animationClass && this.animationClass !== nextAnimationClass) {
      this.renderer.removeClass(element, this.animationClass);
    }

    this.renderer.addClass(element, nextAnimationClass);
    this.renderer.setStyle(element, '--scroll-reveal-delay', `${this.getDelay()}ms`);
    this.animationClass = nextAnimationClass;
  }

  private reveal(): void {
    if (this.isVisible) {
      return;
    }

    this.isVisible = true;
    this.renderer.addClass(this.elementRef.nativeElement, 'is-visible');
    this.revealed.emit();
  }

  private getAnimationType(): ScrollRevealAnimationType {
    return this.animationTypes.has(this.animationType) ? this.animationType : 'fade-up';
  }

  private getDelay(): number {
    if (!Number.isFinite(this.delay)) {
      return 0;
    }

    return Math.max(this.delay, 0);
  }
}
