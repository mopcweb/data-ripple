import tnc from 'tinycolor2';

declare global {
  /**
   *  Corrent interface for DOM Event target
   */
  interface ETarget extends HTMLElement { }

  /**
   *  Corrent interface for DOM Mouse Event
   */
  interface MouseEvent {
    currentTarget: ETarget;
    target: ETarget;
  }
}

/** Type for CSS styles object */
type CssStyles = Record<string, string | number>;

/** Interface for ripple custom options */
interface CustomRippleOptions {
  color?: string;
  timingFunction?: string;
  opacity?: number;
  enterDuration?: number;
  exitDuration?: number;
  sizeModifier?: number;
  disableCentering?: boolean;
  fadeOutOnClick?: boolean;
}

/** Interface for all ripple options */
interface RippleOptions extends Required<CustomRippleOptions> {}

/** Type for RippleDataOptions 'Enum' */
type RippleDataOptions = { readonly [P in keyof RippleOptions]: string } & { readonly root: string };

/** Default ripple options */
const defaultRippleOptions: RippleOptions = {
  enterDuration: 550,
  exitDuration: 400,
  timingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  // timingFunction: 'cubic-bezier(0.2, 0, 0.6, 1)',
  // timingFunction: 'cubic-bezier(.17,.67,.99,.76)',
  // timingFunction: 'cubic-bezier(0, 0, 0.2, 1)',
  sizeModifier: 1,
  disableCentering: false,
  fadeOutOnClick: false,
  opacity: 1,
  color: undefined,
}

// 'cubic-bezier(0.4, 0, 0.2, 1)', 'cubic-bezier(0.25, 0.8, 0.25, 1)', 'cubic-bezier(0.25, 0, 0.2, 1)',

/** Root ripple data attribute */
const RootRippleDataAttribute = 'data-ripple';

/**
 *  Enum for for ripple data attributes. Here I prefer use object to TS Enum because in Enum w/
 *  string values there is no opportunity to use computed value (e.g.: `${RootRippleDataAttribute}-color`)
 */
const RippleDataOptions: RippleDataOptions = {
  root: RootRippleDataAttribute,
  color: `${RootRippleDataAttribute}-color`,
  timingFunction: `${RootRippleDataAttribute}-timing-function`,
  opacity: `${RootRippleDataAttribute}-opacity`,
  enterDuration: `${RootRippleDataAttribute}-enter-duration`,
  exitDuration: `${RootRippleDataAttribute}-exit-duration`,
  sizeModifier: `${RootRippleDataAttribute}-size-modifier`,
  disableCentering: `${RootRippleDataAttribute}-disable-centering`,
  fadeOutOnClick: `${RootRippleDataAttribute}-fade-out-on-click`,
}

/** Default ripple node styles */
const rippleStyles = {
  /** Default ripple node styles */
  default: {
    position: 'absolute',
    'border-radius': '50%',
    transform: 'scale(0)',
  },

  /** Fade in (enter) default animation styles */
  fadeIn: {
    transform: 'scale(1)',
    transition: `all ${defaultRippleOptions.enterDuration} ${defaultRippleOptions.timingFunction}`,
    'will-change': 'transform, opacity',
  },

  /** Fade out (enter) default animation styles */
  fadeOut: {
    opacity: 0,
    transition: `all ${defaultRippleOptions.exitDuration} ${defaultRippleOptions.timingFunction}`,
  },
};

/**
 *  Gets contrast for provided color.
 *  By default returns complement color. If second arg provided -> returns contrast black/white color
 *
 *  @param color - Color string (HEX, rgba, hsla) for which to get contrast
 *  @param [bw] - If true -> generates black/white colors only
 *  @param [contrastThreshold] - Contrast threshold for defining contast black/white color. Recommended 3.1
 *  https://www.w3.org/TR/2008/REC-WCAG20-20081211/#visual-audio-contrast-contrast
 *  @param [black] - Default 'black' color for contrast
 *  @param [white] - Default 'white' color for contrast
 */
export function getContrastColor(
  color: string, bw = false, contrastThreshold = 3.1, black = '#000000', white = '#ffffff',
): string {
  if (!bw) return tnc(color).complement().toHex8String();

  return getContrastRatio(color, black) >= contrastThreshold ? black : white
}

/**
 *  Calculates the contrast ratio between two colors.
 *
 *  Formula: https://www.w3.org/TR/WCAG20-TECHS/G17.html#G17-tests
 *
 *  @param foreground - Color string (HEX, rgba, hsla)
 *  @param background - Color string (HEX, rgba, hsla)
 *
 *  @returns A contrast ratio value in the range 0 - 21.
 */
export function getContrastRatio(foreground: string, background: string): number {
  const lumA = tnc(foreground).getLuminance();
  const lumB = tnc(background).getLuminance();
  return (Math.max(lumA, lumB) + 0.05) / (Math.min(lumA, lumB) + 0.05);
}

/**
 *  Returns provided color with applied opacity(alpha) in HEX8 format.
 *
 *  @param color - Color string (HEX, rgba, hsla)
 *  @param opacity - Opacity number value (between 0 - 1)
 */
export function fade(color: string, opacity: number): string {
  return tnc(color).setAlpha(opacity).toHex8String();
}

/**
 *  Converts object w/ styles into string
 *
 *  @param styles - Object w/ styles
 */
export function convertStylesObjectToString(styles: CssStyles): string {
  let str = '';
  for (const [key, value] of Object.entries(styles)) str += `${key}: ${value};`;
  return str;
}

/**
 *  Adds styles to provided Node
 *
 *  @param htmlElement - HTML Element (Node) to add styles to
 *  @param styles - Styles to add to node
 */
function addStylesToNode(htmlElement: HTMLElement, styles: CssStyles): void {
  // for (const [key, value] of Object.entries(styles)) node.style[key] = value;
  const style = `${htmlElement.getAttribute('style') || ''}; ${convertStylesObjectToString(styles)}`;
  htmlElement.setAttribute('style', style);
}

/**
 *  Gets root element on which to perform ripple
 *
 *  @param e - DOM Mouse event
 */
function getRootFromEvent(e: MouseEvent): HTMLElement {
  const { currentTarget, target } = e;

  return currentTarget instanceof HTMLElement ? currentTarget : target;
}

/**
 *  Sets important styles for ripple root element
 *
 *  @param root - Element for which to create ripple (DOM Node)
 */
function setImportantRootStyles(root: ETarget): void {
  const position = window.getComputedStyle(root).position;
  const overflow = window.getComputedStyle(root).overflow;
  const cursor = window.getComputedStyle(root).cursor;

  let style = root.getAttribute('style') || '';
  let updatedStyle = style;

  if (overflow !== 'hidden') updatedStyle += '; overflow: hidden !important';
  if (!(position === 'relative' || position === 'absolute')) updatedStyle += '; position: relative !important';
  if (!cursor || cursor === 'auto' || cursor === 'default' || cursor === 'unset') updatedStyle += '; cursor: pointer';

  if (style !== updatedStyle) root.setAttribute('style', updatedStyle);
}

/**
 *  Gets custom attributes from root Ripple Node or applies alternatives from custom/default options config
 *
 *  @param root - Element for which to create ripple (DOM Node)
 *  @param customRippleOptions - Optional custom ripple options
 *  @param title - Option propery title
 *  @param [isBoolean=false] - Whether to parse data attribute as boolean
 */
function getCustomAttribute<T = any>(
  root: ETarget, customRippleOptions: CustomRippleOptions, title: keyof RippleDataOptions, isBoolean = false,
): T {
  let attr: string | number | boolean = root.getAttribute(RippleDataOptions[title]);

  const number = parseFloat(attr);
  if (!Number.isNaN(number) && number.toString().length === attr.length) attr = number;

  if (isBoolean) attr = (attr === 'true' || attr === '');

  return attr || (customRippleOptions as any)[title] || (defaultRippleOptions as any)[title];
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
    const isBoolean = typeof (defaultRippleOptions as any)[key] === 'boolean';
    (options as any)[key] = getCustomAttribute(root, customRippleOptions, key as keyof RippleDataOptions, isBoolean);

    if (key === 'color') {
      const bgColor = fade(getContrastColor(window.getComputedStyle(root).backgroundColor, true, 10), 0.15);
      options[key] = options[key] || bgColor
    }
  });

  return options;
}

/**
 *  Gets distance to furthest root element corner
 *
 *  @param x - Event 'x' coordinate
 *  @param y - Event 'y' coordinate
 *  @param rect - Root container rectangle
 */
function getDistanceToFurthestCorner(x: number, y: number, rect: DOMRect) {
  const distX = Math.max(Math.abs(x - rect.left), Math.abs(x - rect.right));
  const distY = Math.max(Math.abs(y - rect.top), Math.abs(y - rect.bottom));
  return Math.sqrt(Math.pow(distX, 2) + Math.pow(distY, 2));
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
  }

  addStylesToNode(rippleNode, styles);
}

/**
 *  Sets custom styles for ripple element
 *
 *  @param rippleNode - Ripple DOM Node
 *  @param root - Element on which to run ripple (DOM Node)
 *  @param rippleOptions - Ripple options
 */
function setRippleCustomStyles(rippleNode: HTMLElement, rippleOptions: RippleOptions) {
  const { color, opacity } = rippleOptions;

  const styles: CssStyles = {
    opacity: opacity,
    background: color,
  };

  addStylesToNode(rippleNode, styles);
}

/**
 *  Sets ripple default styles
 *
 *  @param rippleNode - Ripple DOM Node
 */
function setRippleDefaultStyles(rippleNode: HTMLElement) {
  addStylesToNode(rippleNode, rippleStyles.default);
}

/**
 *  Document mutation observer.
 *  Observes additions to them DOM of elements w/ 'data-ripple' attribute.
 *
 *  @param [rippleCustomOptions] - Optional custom ripple options
 *
 *  @returns callback for disconnect observer.
 */
export function rippleNodeObserver(rippleCustomOptions?: CustomRippleOptions): () => void {
  const config = { childList: true, subtree: true, attributes: true };

  const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      if (!(mutation.type === 'childList' || mutation.type === 'attributes')) return;

      const target: HTMLElement = mutation.target as any;
      if (!target.getAttribute || typeof target.getAttribute !== 'function') return;

      const isRipple = target.getAttribute(RippleDataOptions.root);
      if (isRipple === 'true' || isRipple === '') {

        new Ripple(target, rippleCustomOptions);

        // setImportantRootStyles(target);
        // target.onmousedown = (e) => rippleEffect(e, rippleCustomOptions);
      }
    }
  });

  observer.observe(document, config);

  return observer.disconnect.bind(observer);
}

/** Unsubsribe function for default rippleNodeObserver, which ships w/ package */
export const unsubscribeRippleNodeObserver = rippleNodeObserver();

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
      (this._root as any)[`on${event}`] = (e: any) => this.fadeIn(e);
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
      (this._root as any)[`on${event}`] = () => this.fadeOut(rippleNode);
    });

    root.appendChild(rippleNode);

    const { enterDuration, timingFunction } = this._options;

    this._start = performance.now();

    const styles = {
      ...rippleStyles.fadeIn,
      transition: `all ${enterDuration}ms ${timingFunction}`,
    }

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
