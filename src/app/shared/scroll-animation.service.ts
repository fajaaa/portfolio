import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ScrollAnimationService {
  private readonly animatedElements = new WeakSet<Element>();

  hasAnimated(element: Element): boolean {
    return this.animatedElements.has(element);
  }

  markAnimated(element: Element): void {
    this.animatedElements.add(element);
  }

  observe(element: Element, threshold: number, onVisible: () => void): () => void {
    if (this.hasAnimated(element) || typeof IntersectionObserver === 'undefined') {
      this.markAnimated(element);
      onVisible();
      return () => undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }

        this.markAnimated(element);
        onVisible();
        observer.unobserve(element);
        observer.disconnect();
      },
      { threshold: this.normalizeThreshold(threshold) },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }

  private normalizeThreshold(threshold: number): number {
    if (!Number.isFinite(threshold)) {
      return 0.2;
    }

    return Math.min(Math.max(threshold, 0), 1);
  }
}
