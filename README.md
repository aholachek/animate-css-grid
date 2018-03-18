# Animate CSS Grid

![demo of animate-css-grid in action](./demo/grid.gif)

This small script makes it super easy to make sure your CSS grid transitions gracefully from one state to another.
When the grid container, or one of its immediate children, is updated via the addition or removal of a class, the grid will smoothly transition its children to their new positions and sizes.

[Example on Codepen](https://codepen.io/aholachek/pen/VXjOPB)

## How to use it

Just call the `wrapGrid` method on your grid container.

The optional config object allows you to control duration, staggering, and easing.

ES6 Module:

`yarn add animate-css-grid`

```js
import { wrapGrid } from animateCSSGrid

const grid = document.querySelector(".grid");

const { unwrapGrid } = wrapGrid(grid, {duration: 500});

// later, to remove transitions
unwrapGrid()
```

Or from a script tag:

```html
<script src="https://unpkg.com/animate-css-grid@latest"></script>

<script>
  const grid = document.querySelector(".grid");
  const { unwrapGrid } = animateCSSGrid.wrapGrid(grid, {stagger: true});
</script>
```

[Available easing functions](https://sole.github.io/tween.js/examples/03_graphs.html).

Example options object:

```js
{
  // create a stagger effect (default is false)
  stagger: true,
  // specify a duration in ms (default is 250 ms)
  duration: 500
  // specify an easing as a string. default is 'Quadratic.InOut'
  easing: 'Sinusoidal.InOut'
}
```

## How it works

The script registers a `MutationObserver` that activates when the grid or one of its immediate children adds or loses a class.
It uses the FLIP animation technique to smoothly update the grid, applying a counter transform to the children of each item so that they do not appear distorted while the transition occurs.

## Requirements

1.  The updates to the grid will have to come from addition or removal of a class. Currently, inline style updates will not trigger transitions.
2.  If a grid item has children, they should be surrounded by a single container element.

OK:

```html
<!-- grid style applied via a class -->
<div class="some-grid-class-that-changes">
  <!-- a grid item with a single child -->
  <div class="grid-item">
    <div>
      ...child 1
      ...child 2
    </div>
  </div>
<div>
```

Not going to work:

```html
<!-- grid styles applied inline -->
<div style="[grid styles that change]">
  <!-- a grid item with multiple children -->
  <div class="grid-item">
      ...child 1
      ...child 2
  </div>
<div>
```
