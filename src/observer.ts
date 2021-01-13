import { CustomRippleOptions, RippleDataOptions } from './typings';
import { Ripple } from './ripple';

/**
 *  Document mutation observer.
 *  Observes additions to them DOM of elements w/ 'data-ripple' attribute.
 *
 *  @param [rippleCustomOptions] - Optional custom ripple options.
 *
 *  @returns callback for disconnect observer.
 */
export function rippleNodeObserver(rippleCustomOptions?: CustomRippleOptions): () => void {
  const config = { childList: true, subtree: true, attributes: true };

  const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      if (!(mutation.type === 'childList' || mutation.type === 'attributes')) return;

      /* eslint-disable-next-line */
      const target: HTMLElement = mutation.target as any;
      if (!target.getAttribute || typeof target.getAttribute !== 'function') return;

      const isRipple = target.getAttribute(RippleDataOptions.root);
      if (isRipple === 'true' || isRipple === '') {
        /* eslint-disable-next-line */
        new Ripple(target, rippleCustomOptions);
      }
    }
  });

  observer.observe(document, config);

  const ripples = document.querySelectorAll(`[${RippleDataOptions.root}]`);
  /* eslint-disable-next-line */
  if (ripples) Array.from(ripples).forEach((item: HTMLElement) => { new Ripple(item, rippleCustomOptions); });

  return observer.disconnect.bind(observer);
}

/** Unsubsribe function for default rippleNodeObserver, which ships w/ package */
export const unsubscribeRippleNodeObserver = rippleNodeObserver();
