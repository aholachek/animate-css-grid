# Animate CSS Grid

Performantly animate all CSS grid properties, including:

### `grid-column` and `grid-row`

<a href="https://codepen.io/aholachek/pen/VXjOPB">
<img src="./examples/grid-column-optimized.gif" alt="grid-column and grid-row" width="500px">
</a>


### `grid-template-columns`

<a href="https://codepen.io/aholachek/pen/VXjOPB">
<img src="./examples/grid-template-columns-optimized-1.gif" alt="grid-template-columns" width="500px">
</a>

### `grid-gap`

<a href="https://codepen.io/aholachek/pen/VXjOPB">
<img src="./examples/grid-gap-optimized-1.gif" alt="grid-gap" width="500px">
</a>


#### [Fork Photo Grid Example on CodeSandbox](https://codesandbox.io/s/animate-css-grid-template-t6qsf)


### Why use animate-css-grid?

This library uses transforms to transition between different layout states, which means, in comparison to pure [CSS grid animations](https://web.dev/css-animated-grid-layouts/), it offers:

- better performance 
- more flexibility in terms of what properties can be animated
- more configurable animations (easing options, staggers)

Want to have a look for yourself? Feel free to check out [this Mondrian animated with CSS keyframes](https://codepen.io/aholachek/pen/poOeXBM) and compare it with  [the same UI animated with animate-css-grid.](https://codepen.io/aholachek/pen/XWPMwEx)

## How to use it

Just call the `wrapGrid` method on your grid container, and optionally provide a config object as a second argument.
If the grid is removed from the page, the animations will automatically be cleaned up as well.


`yarn add animate-css-grid` or `npm install animate-css-grid`

```js
import { wrapGrid } from 'animate-css-grid'

const grid = document.querySelector(".grid");
wrapGrid(grid);
```

Or from a script tag:

```html
<script src="https://unpkg.com/animate-css-grid@latest"></script>

<script>
  const grid = document.querySelector(".grid");
  animateCSSGrid.wrapGrid(grid, {duration : 600});
</script>
```

Optional config object:

```js
{
  // int: default is 0 ms
  stagger: 100,
  // int: default is 250 ms
  duration: 500
  // string: default is 'easeInOut'
  easing: 'backInOut',
  // function: called with list of elements about to animate
  onStart: (animatingElementList)=> {},
  // function: called with list of elements that just finished animating
  // cancelled animations will not trigger onEnd
  onEnd: (animatingElementList)=> {}
}
```

Available easing functions:

- `'linear'`
- `'easeIn'` / `'easeOut'` / `'easeInOut'`
- `'circIn'` / `'circOut'` / `'circInOut'`
- `'backIn'` / `'backOut'` / `'backInOut'`
- `'anticipate'`

[Learn more about available easing functions here.](https://popmotion.io/api/easing/)

Two functions are returned by the `wrapGrid` call that you probably won't need to use:

```js
import { wrapGrid } from animateCSSGrid

const grid = document.querySelector(".grid");
const { unwrapGrid, forceGridAnimation } = wrapGrid(grid);

// if you want the grid to transition after updating an inline style
// you need to call forceGridAnimation
grid.style.width = '500px'
forceGridAnimation()

// if you want to remove animations but not the grid itself
unwrapGrid()
```

## Requirements

1.  The updates to the grid will have to come from addition or removal of a class or element. Currently, inline style updates will not trigger transitions. (Although you can manually trigger transitions in that case by calling `forceGridAnimation()`)
2.  **Important** If a grid item has children, they should be surrounded by a single container element. This is so we can apply a counter scale and prevent children elements from getting warped during scale transitions of the parent.

Example:

```html
<!-- grid class -->
<ul class="some-grid-class-that-changes">
  <li class="grid-item">
    <!-- each grid item must have a single direct child -->
    <div>
      <h3>Item title</h3>
      <div>Item body</div>
    </div>
  </li>
<div>
```

## How it works

The script registers a `MutationObserver` that activates when the grid or one of its children adds or loses a class or element. That means there's no need to remove the animations before removing the grid, everything should be cleaned up automatically.
It uses the FLIP animation technique to smoothly update the grid, applying a counter transform to the children of each item so that they do not appear distorted while the transition occurs.

It should work on container elements without CSS grid applied as well, but was developed and tested with CSS grid in mind.

## Usage with Frameworks

The `animate-css-grid` library can easily be used with frameworks like React or Vue.

Check out the [React example](https://codepen.io/aholachek/pen/mxwvmV) or the [Vue example](https://codepen.io/sustained/pen/Rwbdgob) on Codepen!
