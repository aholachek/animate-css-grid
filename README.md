# Animate CSS Grid

![demo of animate-css-grid in action](./demo/grid.gif)

This small script makes it super easy to make sure your CSS grid transitions gracefully from one state to another.
If the content of the grid changes, or if the grid or one of its children is updated with the addition or removal of a class, the grid will automatically transition  to its new configuration.

[Examples on Codepen](https://codepen.io/collection/XGWeaG/)

## How to use it

Just call the `wrapGrid` method on your grid container, and optionally provide a config object as a second argument.

ES6 Module:

`yarn add animate-css-grid`

```js
import { wrapGrid } from animateCSSGrid

const grid = document.querySelector(".grid");

const { unwrapGrid, forceGridAnimation } = wrapGrid(grid, {duration: 500});

// later, to remove transitions
unwrapGrid()

// later, if you are changing grid layout with inline styles and still want the grid to animate
grid.style.width = '200px'
forceGridAnimation()
```

Or from a script tag:

```html
<script src="https://unpkg.com/animate-css-grid@latest"></script>

<script>
  const grid = document.querySelector(".grid");
  const { unwrapGrid } = animateCSSGrid.wrapGrid(grid, {stagger: true});
</script>
```

Example optional config object:

```js
{
  // default is false
  stagger: true,
  // default is 250 ms
  duration: 500
  // default is 'Quadratic.InOut'
  easing: 'Sinusoidal.InOut'
}
```
[Available easing functions](https://sole.github.io/tween.js/examples/03_graphs.html).

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
