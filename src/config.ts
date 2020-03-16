import { RippleOptions } from './typings';

/** Default ripple options */
export const defaultRippleOptions: RippleOptions = {
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
};

/** Default ripple node styles */
export const rippleStyles = {
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
