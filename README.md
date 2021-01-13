# data-ripple

[![npm version](https://img.shields.io/npm/v/data-ripple.svg)](https://www.npmjs.com/package/data-ripple) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/mopcweb/data-ripple/blob/master/LICENSE) [![Size](https://img.shields.io/bundlephobia/minzip/data-ripple.svg)](https://npmjs.org/package/data-ripple) [![Downloads](https://img.shields.io/npm/dm/data-ripple.svg)](https://npmjs.org/package/data-ripple)

Inspired by Material Design ripple effect.

Designed to be framework agnostic and work w/ modern SPA where state of app could be changed dynamically over time, so ripple options also will change.

## Install

```bash
npm i data-ripple
```

## Usage

### Declarative

After importing module, declarative approach will find and init all elements w/ data-ripple attribute

```ts
import 'data-ripple';
```

```html
<button data-ripple>Click me</button>
<div data-ripple>Click me</div>
<span data-ripple>Click me</span>
```

### Imperative

```ts
import { rippleEffect, Ripple } from 'data-ripple';

...

const ripple = document.querySelector('#ripple');
new Ripple(ripple, { ... });

function handleMouseDown(e) {
  rippleEffect(e);
}

...
```

```html
<button id="ripple">Click me</button>

<div onmousedown="handleMouseDown(event)">Click me</div>
```

## Options

Declarative | Imperative | Type | Default | Description
----------- | ---------- | ---- | ------- | -----------
  color     | data-ripple-color | string | contrast (black/white) color for container background, 0.15 opacity | Ripple effect color (rgba, hsla, HEX)
  timingFunction | data-ripple-timing-function | string | cubic-bezier(0.4, 0, 0.2, 1) | Animation timing function
  opacity | data-ripple-opacity | number | 1 | Ripple effect opacity value in range 0 - 1
  sizeModifier | data-ripple-size-modifier | number | 1 | Modifier for ripple effect size (radius)
  enterDuration | data-ripple-enter-duration | number | 550 | Value in ms for ripple effect fadeIn animation
  exitDuration | data-ripple-exit-duration | number | 400 | Value in ms for ripple effect fadeOut animation
  disableCentering | data-ripple-disable-centering | boolean | false | By default ripple effect animation will start under user mouse position. This option states for all ripples starts directly from container element center
  fadeOutOnClick | data-ripple-fade-out-on-click | boolean | false | By default ripple effect will start on mouse down and will terminate only on pointe release. This options overrides this behaviour to execute ripple fadeOut directly after fadeIn animation


## License

This project is licensed under the terms of the [MIT license](https://github.com/mopcweb/data-ripple/blob/master/LICENSE).
