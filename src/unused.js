const rectInViewport = (rect, gridBoundingClientRect) => {
  const left = rect.left;
  const top = rect.top + gridBoundingClientRect.top;
  const right = left + rect.width;
  const bottom = top + rect.height;
  return (
    bottom > 0 &&
    top < window.innerHeight &&
    right > 0 &&
    left < window.innerWidth
  );
};
