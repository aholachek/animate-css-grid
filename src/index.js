import TWEEN from '@tweenjs/tween.js';
import throttle from 'lodash.throttle';

const getScrollAwareBoundingClientRect = el => {
  const { top, left, width, height } = el.getBoundingClientRect();
  const rect = { top, left, width, height };
  rect.top += window.scrollY;
  rect.left += window.scrollX;
  return rect;
};

// return a function that take a reference to a grid dom node and optional config
export const wrapGrid = (
  container,
  { duration = 250, stagger, easing = 'Quadratic.InOut' } = {}
) => {
  // initially and after every transition, record element positions
  const recordPositions = elements => {
    [...elements].forEach(el => {
      if (typeof el.getBoundingClientRect !== 'function') return;
      const rect = getScrollAwareBoundingClientRect(el);
      const data = ['top', 'left', 'width', 'height'];
      data.forEach(
        d => (el.dataset[`cached${d[0].toUpperCase()}${d.slice(1)}`] = rect[d])
      );
    });
  };

  recordPositions(container.children);

  const throttledResizeListener = throttle(() => {
    recordPositions(container.children);
  }, 250);

  window.addEventListener('resize', throttledResizeListener);

  const mutationCallback = mutationsList => {
    // some grid items might have been added or removed, if so, update cached positions
    mutationsList.filter(m => m.type === 'childList').length &&
      recordPositions(container.children);

    // then, check if the grid or grid items have had classes added or removed
    const relevantMutationHappened = mutationsList.filter(
      m => m.attributeName === 'class'
    ).length;

    if (!relevantMutationHappened) return;
    [...container.children]
      .map(el => ({
        el,
        boundingClientRect: getScrollAwareBoundingClientRect(el),
      }))
      .filter(({ el, boundingClientRect }) => {
        if (
          boundingClientRect.top !== parseFloat(el.dataset.cachedTop) ||
          boundingClientRect.left !== parseFloat(el.dataset.cachedLeft) ||
          boundingClientRect.width !== parseFloat(el.dataset.cachedWidth) ||
          boundingClientRect.height !== parseFloat(el.dataset.cachedHeight)
        ) {
          return true;
        }
        return false;
      })
      .forEach(({ el, boundingClientRect }, i, gridItems) => {
        if ([...el.children].length > 1)
          throw new Error(
            'Make sure every grid item has a single container element surrounding its children'
          );

        const { top, left, width, height } = boundingClientRect;
        const { cachedTop, cachedLeft, cachedWidth, cachedHeight } = el.dataset;

        const coords = {};

        coords.scaleX = parseInt(cachedWidth) / width;
        coords.scaleY = parseInt(cachedHeight) / height;
        coords.translateX = parseInt(cachedLeft) - left;
        coords.translateY = parseInt(cachedTop) - top;

        el.style.transform = `translate(${coords.translateX}px, ${
          coords.translateY
        }px) scale(${coords.scaleX}, ${coords.scaleY})`;
        el.style.transformOrigin = '0 0';
        el.children[0].style.transform = `scale(${1 / coords.scaleX},${1 /
          coords.scaleY})`;

        const tween = new TWEEN.Tween(coords)
          .to({ translateX: 0, translateY: 0, scaleX: 1, scaleY: 1 }, duration)
          .easing(TWEEN.Easing[easing.split('.')[0]][easing.split('.')[1]])
          .onUpdate(function() {
            el.style.transform = `translate(${coords.translateX}px, ${
              coords.translateY
            }px) scale(${coords.scaleX}, ${coords.scaleY})`;
            el.children[0].style.transform = `scale(${1 / coords.scaleX},${1 /
              coords.scaleY})`;
            if (
              coords.translateX === 0 &&
              coords.translateY === 0 &&
              coords.scaleX === 1 &&
              coords.scaleY === 1
            ) {
              recordPositions([el]);
            }
          });

        if (stagger) tween.delay(duration / gridItems.length * i);

        const animate = time => {
          if (!tween.isPlaying()) return;
          requestAnimationFrame(animate);
          TWEEN.update(time);
        };

        tween.start();
        requestAnimationFrame(animate);
      });
  };

  const observer = new MutationObserver(mutationCallback);
  observer.observe(container, {
    childList: true,
    attributes: true,
    subtree: true,
  });

  const unwrapGrid = () => {
    window.removeEventListener(null, throttledResizeListener);
    observer.disconnect();
  };

  return { unwrapGrid };
};
