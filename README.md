# Animate CSS Grid

![demo of animate-css-grid in action](./demo/grid.gif)

This small (4kb minified and gzipped) script wraps a CSS grid (or really, any container element) and animates updates to its children.
When the grid container, or one of its immediate children, is updated via the addition or removal of a class, the grid will smoothly transition its children to their new positions and sizes.

[Example on Codepen](https://codepen.io/aholachek/pen/VXjOPB)

## How to use it

ES6 Modules:

`yarn add animate-css-grid`

```js
import { wrapGrid } from animateCSSGrid
const grid = document.querySelector(".grid");

const { unwrapGrid } = wrapGrid(grid, {
  // create a stagger effect
  stagger: true,
  // specify a duration (default is 300 ms)
  duration: 300
});

// later, to remove transitions
unwrapGrid()
```

Or from a script tag:
```html
<script src="https://unpkg.com/animate-css-grid@latest"></script>

<script>
  const grid = document.querySelector(".grid");
  const { unwrapGrid } = animateCSSGrid.wrapGrid(grid);
</script>
```


## How it works

The script registers a `MutationObserver` that activates when the grid or one of its immediate children adds or loses a class.
It uses the FLIP animation technique to smoothly update the grid.

## Requiremenets

The updates to the grid will have to come from addition or removal of a class. Currently, inline style updates will not trigger transitions.
If a grid item has children, they should be surrounded by a single container element. 

OK:
```html
<div class="some-grid-class-that-changes">

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
<div style="[grid styles that change]">

  <div class="grid-item">
      ...child 1
      ...child 2
  </div>

<div>
```
