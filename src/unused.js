const rectInViewport = (rect, gridBoundingClientRect) => {
  const left = rect.left + gridBoundingClientRect.left;
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

// .filter(({ el, boundingClientRect }) => {
//   const cachedData = cachedPositionData[el.dataset[DATASET_KEY]];
//   const prevBoundingClientRect = cachedData.rect;
//   const prevGridBoundingClientRect = cachedData.gridBoundingClientRect;
//   if (
//     rectInViewport(boundingClientRect, gridBoundingClientRect) ||
//     rectInViewport(prevBoundingClientRect, prevGridBoundingClientRect)
//   ) {
//     return true;
//   }
//   return false;
// });
