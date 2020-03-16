import tnc from 'tinycolor2';

import { CssStyles, CustomRippleOptions, RippleDataOptions } from './typings';
import { defaultRippleOptions } from './config';

/** Check if object is empty */
/* eslint-disable-next-line */
export const isEmpty = (obj: Record<any, any>): boolean => !Object.keys(obj).length;

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

  return getContrastRatio(color, black) >= contrastThreshold ? black : white;
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
export function addStylesToNode(htmlElement: HTMLElement, styles: CssStyles): void {
  // for (const [key, value] of Object.entries(styles)) node.style[key] = value;
  const style = `${htmlElement.getAttribute('style') || ''}; ${convertStylesObjectToString(styles)}`;
  htmlElement.setAttribute('style', style);
}

/**
 *  Gets root element on which to perform ripple
 *
 *  @param e - DOM Mouse event
 */
export function getRootFromEvent(e: MouseEvent): HTMLElement {
  const { currentTarget, target } = e;

  return currentTarget instanceof HTMLElement ? currentTarget : target;
}


/**
 *  Gets distance to furthest root element corner
 *
 *  @param x - Event 'x' coordinate
 *  @param y - Event 'y' coordinate
 *  @param rect - Root container rectangle
 */
export function getDistanceToFurthestCorner(x: number, y: number, rect: DOMRect): number {
  const distX = Math.max(Math.abs(x - rect.left), Math.abs(x - rect.right));
  const distY = Math.max(Math.abs(y - rect.top), Math.abs(y - rect.bottom));
  return Math.sqrt((distX ** 2) + (distY ** 2));
}

/**
 *  Gets custom attributes from root Ripple Node or applies alternatives from custom/default options config
 *
 *  @param root - Element for which to create ripple (DOM Node)
 *  @param customRippleOptions - Optional custom ripple options
 *  @param title - Option propery title
 *  @param [isBoolean=false] - Whether to parse data attribute as boolean
 */
/* eslint-disable-next-line */
export function getCustomAttribute<T = any>(
  root: ETarget, customRippleOptions: CustomRippleOptions, title: keyof RippleDataOptions, isBoolean = false,
): T {
  let attr: string | number | boolean = root.getAttribute(RippleDataOptions[title]);

  const number = parseFloat(attr);
  if (!Number.isNaN(number) && number.toString().length === attr.length) attr = number;

  if (isBoolean) attr = (attr === 'true' || attr === '');

  /* eslint-disable-next-line */
  return attr || (customRippleOptions as any)[title] || (defaultRippleOptions as any)[title];
}
