import TWEEN from '@tweenjs/tween.js';
import throttle from 'lodash.throttle';

const getGridAwareBoundingClientRect = (gridBoundingClientRect, el) => {
  const { top, left, width, height } = el.getBoundingClientRect();
  const rect = { top, left, width, height };
  rect.top -= gridBoundingClientRect.top;
  rect.left -= gridBoundingClientRect.left;
  return rect;
};

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

// return a function that take a reference to a grid dom node and optional config
export const wrapGrid = (
  container,
  { duration = 250, stagger, easing = 'Quadratic.InOut' } = {}
) => {
  // initially and after every transition, record element positions
  const recordPositions = elements => {
    const gridBoundingClientRect = container.getBoundingClientRect();
    [...elements].forEach(el => {
      if (typeof el.getBoundingClientRect !== 'function') return;
      const rect = getGridAwareBoundingClientRect(gridBoundingClientRect, el);
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
    if (mutationsList !== 'forceGridAnimation') {
      // check if we care about the mutation
      const relevantMutationHappened = mutationsList.filter(
        m =>
          m.attributeName === 'class' ||
          m.addedNodes.length ||
          m.removedNodes.length
      ).length;

      if (!relevantMutationHappened) return;
    }

    const gridBoundingClientRect = container.getBoundingClientRect();

    [...container.children]
      .map(el => ({
        el,
        boundingClientRect: getGridAwareBoundingClientRect(
          gridBoundingClientRect,
          el
        ),
      }))
      .filter(({ el, boundingClientRect }) => {
        const cachedRect = {
          top: parseFloat(el.dataset.cachedTop),
          left: parseFloat(el.dataset.cachedLeft),
          width: parseFloat(el.dataset.cachedWidth),
          height: parseFloat(el.dataset.cachedHeight),
        };
        // don't animate the initial appearance of elements,
        // just cache their position so they can be animated later
        if (!el.dataset.cachedHeight && !el.dataset.cachedWidth) {
          recordPositions([el]);
          return false;
        } else if (
          boundingClientRect.top === cachedRect.top &&
          boundingClientRect.left === cachedRect.left &&
          boundingClientRect.width === cachedRect.width &&
          boundingClientRect.height === cachedRect.height
        ) {
          // if it didn't change, dont animated it
          return false;
        } else if (
          !rectInViewport(boundingClientRect, gridBoundingClientRect) &&
          !rectInViewport(cachedRect, gridBoundingClientRect)
        ) {
          // if it's not in the viewport, dont animate it
          return false;
        }
        return true;
      })
      .forEach(({ el, boundingClientRect }, i, gridItems) => {
        if ([...el.children].length > 1)
          throw new Error(
            'Make sure every grid item has a single container element surrounding its children'
          );

        const { top, left, width, height } = boundingClientRect;
        const { cachedTop, cachedLeft, cachedWidth, cachedHeight } = el.dataset;

        const coords = {};

        coords.scaleX = parseFloat(cachedWidth) / width;
        coords.scaleY = parseFloat(cachedHeight) / height;
        coords.translateX = parseFloat(cachedLeft) - left;
        coords.translateY = parseFloat(cachedTop) - top;

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
              requestAnimationFrame(() => {
                recordPositions([el]);
              });
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
  const throttledMutationCallback = throttle(mutationCallback, 100);
  const observer = new MutationObserver(throttledMutationCallback);
  observer.observe(container, {
    childList: true,
    attributes: true,
    subtree: true,
    attributeFilter: ['class'],
  });

  const unwrapGrid = () => {
    window.removeEventListener('resize', throttledResizeListener);
    observer.disconnect();
  };

  const forceGridAnimation = () => mutationCallback('forceGridAnimation');

  return { unwrapGrid, forceGridAnimation };
};
