# Animate CSS Grid

This small script wraps a CSS grid (or really, any container element) and animates updates to its children. 
When the grid container, or one of its immediate children, is updated via the addition or removal of a class, the grid will smoothly transition its children to their new positions and sizes.

## How to use it

``` js
const grid = document.querySelector(".grid");
const { stopGridAnimations } = animateMutations(grid, {
  stagger: true,
  duration: 300
});

// later, to remove transitions
stopGridAnimations()
```

## How it works

The script registers a `MutationObserver` that activates when the grid or one of its immediate children adds or loses a class.
It uses the FLIP animation technique to smoothly update the grid.

## Caveats

The updates to the grid will have to come from addition or removal of a class. Currently, inline style updates will not trigger transitions.
