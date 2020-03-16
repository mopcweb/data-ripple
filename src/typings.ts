/* eslint-disable @typescript-eslint/interface-name-prefix */
declare global {
  /**
   *  Corrent interface for DOM Event target
   */
  type ETarget = HTMLElement;

  /**
   *  Corrent interface for DOM Mouse Event
   */
  interface MouseEvent {
    currentTarget: ETarget;
    target: ETarget;
  }
}

/** Type for CSS styles object */
export type CssStyles = Record<string, string | number>;

/** Interface for ripple custom options */
export interface CustomRippleOptions {
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
export type RippleOptions = Required<CustomRippleOptions>;

/** Type for RippleDataOptions 'Enum' */
export type RippleDataOptions = { readonly [P in keyof RippleOptions]: string } & { readonly root: string };

// 'cubic-bezier(0.4, 0, 0.2, 1)', 'cubic-bezier(0.25, 0.8, 0.25, 1)', 'cubic-bezier(0.25, 0, 0.2, 1)',

/** Root ripple data attribute */
export const RootRippleDataAttribute = 'data-ripple';

/**
 *  Enum for for ripple data attributes. Here I prefer use object to TS Enum because in Enum w/
 *  string values there is no opportunity to use computed value (e.g.: `${RootRippleDataAttribute}-color`)
 */
export const RippleDataOptions: RippleDataOptions = {
  root: RootRippleDataAttribute,
  color: `${RootRippleDataAttribute}-color`,
  timingFunction: `${RootRippleDataAttribute}-timing-function`,
  opacity: `${RootRippleDataAttribute}-opacity`,
  enterDuration: `${RootRippleDataAttribute}-enter-duration`,
  exitDuration: `${RootRippleDataAttribute}-exit-duration`,
  sizeModifier: `${RootRippleDataAttribute}-size-modifier`,
  disableCentering: `${RootRippleDataAttribute}-disable-centering`,
  fadeOutOnClick: `${RootRippleDataAttribute}-fade-out-on-click`,
};
