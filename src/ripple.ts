import { CssStyles, CustomRippleOptions, RippleOptions, RippleDataOptions } from './typings';
import { defaultRippleOptions, rippleStyles } from './config';
import {
  getContrastColor, fade, addStylesToNode, getRootFromEvent, getDistanceToFurthestCorner, getCustomAttribute,
  isEmpty,
} from './helpers';

/**
 *  Sets important styles for ripple root element.
 *
 *  @param root - Element for which to create ripple (DOM Node)
 */
function setImportantRootStyles(root: ETarget): void {
  const { position } = window.getComputedStyle(root);
  const { display } = window.getComputedStyle(root);
  const { overflow } = window.getComputedStyle(root);
  const { cursor } = window.getComputedStyle(root);

  const styles = {
    position: 'relative !important',
    display: 'inline-block',
    overflow: 'hidden !important',
    cursor: 'pointer',
  };

  if (position === 'relative' || position === 'absolute') delete styles.position;
  if (!(display === 'unset' || display === 'inherit' || display === 'initial' || display === 'inline')) delete styles.display;
  if (overflow === 'hidden') delete styles.overflow;
  if (!(!cursor || cursor === 'auto' || cursor === 'default' || cursor === 'unset')) delete styles.cursor;

  if (!isEmpty(styles)) addStylesToNode(root, styles);
}

/**
 *  Defines all ripple options parsing data-attributes, custom / default options
 *
 *  @param root - Element for which to create ripple (DOM Node)
 *  @param [customRippleOptions] - Optional custom ripple options
 */
function defineCustomOptions(root: ETarget, customRippleOptions: CustomRippleOptions): RippleOptions {
  /* eslint-disable-next-line */
  customRippleOptions = { ...defaultRippleOptions, ...customRippleOptions };

  const options: RippleOptions = { } as RippleOptions;
  Object.keys(defaultRippleOptions).forEach((key) => {
    /* eslint-disable-next-line */
    const isBoolean = typeof (defaultRippleOptions as any)[key] === 'boolean';
    /* eslint-disable-next-line */
    (options as any)[key] = getCustomAttribute(root, customRippleOptions, key as keyof RippleDataOptions, isBoolean);

    if (key === 'color') {
      const bgColor = fade(getContrastColor(window.getComputedStyle(root).backgroundColor, true, 10), 0.15);
      options[key] = options[key] || bgColor;
    }
  });

  return options;
}

/**
 *  Sets positioning styles for ripple element
 *
 *  @param e - DOM Mouse event on root element
 *  @param rippleNode - Ripple DOM Node
 *  @param rippleOptions - Ripple options
 */
function setRipplePositioningStyles(e: MouseEvent, rippleNode: HTMLElement, rippleOptions: RippleOptions): void {
  const { currentTarget, target, clientX, clientY } = e;

  const root = currentTarget instanceof HTMLElement ? currentTarget : target;

  const { disableCentering, sizeModifier } = rippleOptions;
  const rect = root.getBoundingClientRect();

  const x = disableCentering ? rect.left + rect.width / 2 : clientX;
  const y = disableCentering ? rect.top + rect.height / 2 : clientY;

  const radius = getDistanceToFurthestCorner(clientX, clientY, rect) * sizeModifier;
  const offsetX = x - rect.left;
  const offsetY = y - rect.top;

  const styles: CssStyles = {
    top: `${offsetY - radius}px`,
    left: `${offsetX - radius}px`,
    width: `${radius * 2}px`,
    height: `${radius * 2}px`,
  };

  addStylesToNode(rippleNode, styles);
}

/**
 *  Sets custom styles for ripple element
 *
 *  @param rippleNode - Ripple DOM Node
 *  @param root - Element on which to run ripple (DOM Node)
 *  @param rippleOptions - Ripple options
 */
function setRippleCustomStyles(rippleNode: HTMLElement, rippleOptions: RippleOptions): void {
  const { color, opacity } = rippleOptions;
  const styles: CssStyles = { opacity, background: color };
  addStylesToNode(rippleNode, styles);
}

/**
 *  Sets ripple default styles
 *
 *  @param rippleNode - Ripple DOM Node
 */
function setRippleDefaultStyles(rippleNode: HTMLElement): void {
  addStylesToNode(rippleNode, rippleStyles.default);
}

/**
 *  Event listener for ripple effect as event listener for mousedown DOM Event.
 *
 *  If no DOM Node provided -> creates DOM Node and handles ripple effect on it.
 *  Else -> handles ripple effect on already created DOM Node.
 *
 *  @param e - DOM Mouse event
 *  @param [customRippleOptions] - Optional custom ripple options
 *  @param [staticRipple] - Static Ripple config: DOM Node and timer
 */
export function rippleEffect(e: MouseEvent, customRippleOptions?: CustomRippleOptions): void {
  const root = getRootFromEvent(e);
  /* eslint-disable-next-line */
  const ripple = new Ripple(root, customRippleOptions);
  ripple.fadeIn(e);
}

/**
 *  Ripple constructor
 *
 *  @param root - Root element for which to create ripple effect
 *  @param [options] - Optional custom ripple options
 */
export class Ripple {
  /** Ripple root (container) element */
  private _root: HTMLElement;

  /** Ripple custom options */
  private _options: RippleOptions;

  /** Ripple effect start point */
  private _start: number;

  /** List of events which trigers fadeIn */
  private _fadeInTriggers = ['mousedown', 'touchstart'];

  /** List of events which trigers fadeOut */
  private _fadeOutTriggers = ['mouseup', 'mouseleave', 'touchend'];

  public constructor(
    root: HTMLElement,
    options?: CustomRippleOptions,
  ) {
    this._root = root;
    this._options = { ...defaultRippleOptions, ...options };

    setImportantRootStyles(this._root);

    this._fadeInTriggers.forEach((event) => {
      /* eslint-disable-next-line */
      (this._root as any)[`on${event}`] = (e: MouseEvent): void => this.fadeIn(e);
      // this._root[`on${event}`] = this.fadeIn.bind(this);
    });
  }

  /**
   *  Enter ripple animation.
   *
   *  @param e - DOM Mouse event
   */
  public fadeIn(e: MouseEvent): void {
    const root = getRootFromEvent(e);
    this._options = defineCustomOptions(root, this._options);

    const rippleNode = document.createElement('div');

    setRippleDefaultStyles(rippleNode);
    setRippleCustomStyles(rippleNode, this._options);
    setRipplePositioningStyles(e, rippleNode, this._options);

    this._fadeOutTriggers.forEach((event) => {
      /* eslint-disable-next-line */
      (this._root as any)[`on${event}`] = (): void => this.fadeOut(rippleNode);
    });

    root.appendChild(rippleNode);

    const { enterDuration, timingFunction } = this._options;

    this._start = performance.now();

    const styles = {
      ...rippleStyles.fadeIn,
      transition: `all ${enterDuration}ms ${timingFunction}`,
    };

    setTimeout(() => addStylesToNode(rippleNode, styles), 0);

    if (this._options.fadeOutOnClick) this.fadeOut(rippleNode);
  }

  /**
   *  Exit animation.
   *
   *  @param rippleNode - Ripple DOM Node
   */
  private fadeOut(rippleNode: HTMLElement): void {
    const { exitDuration, timingFunction } = this._options;

    const styles = {
      ...rippleStyles.fadeOut,
      transition: `all ${exitDuration}ms ${timingFunction}`,
    };

    setTimeout(() => {
      addStylesToNode(rippleNode, styles);
      setTimeout(() => rippleNode.remove(), exitDuration);
    }, this.calculateFadeOutDelay());
  }

  /**
   *  Calculates delay between fadeIn animation end and fadeOut animation start
   */
  private calculateFadeOutDelay(): number {
    const { exitDuration, enterDuration } = this._options;

    const actualAnimationDuration = Math.round(performance.now() - this._start);
    const minAnimationDuration = enterDuration - exitDuration / 3;
    // const minAnimationDuration = enterDuration;

    return Math.max(minAnimationDuration - actualAnimationDuration, 0);
  }
}
