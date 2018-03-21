import TWEEN from '@tweenjs/tween.js';
import throttle from 'lodash.throttle';

const DATASET_KEY = 'animateGridId';

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
  // all cached position data, and in-progress tween data, is stored here
  const cachedPositionData = {};

  // initially and after every transition, record element positions
  const recordPositions = elements => {
    const gridBoundingClientRect = container.getBoundingClientRect();
    [...elements].forEach(el => {
      if (typeof el.getBoundingClientRect !== 'function') return;
      if (!el.dataset[DATASET_KEY]) {
        const animateGridId = Math.random();
        el.dataset[DATASET_KEY] = animateGridId;
        cachedPositionData[animateGridId] = {};
      }
      const animateGridId = el.dataset[DATASET_KEY];
      const rect = getGridAwareBoundingClientRect(gridBoundingClientRect, el);
      cachedPositionData[animateGridId].rect = rect;
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

    const childrenElements = [...container.children];

    // stop current transitions and cache relevant position data for in-transit elements
    const x = childrenElements
      .filter(el => {
        const cachedData = cachedPositionData[el.dataset[DATASET_KEY]];
        if (cachedData && cachedData.tween) {
          cachedData.tween.stop();
          delete cachedData.tween;
          return true;
        }
      })
      .forEach(el => {
        el.style.transform = '';
        el.children[0].style.transform = '';
      });

    childrenElements
      .map(el => ({
        el,
        boundingClientRect: getGridAwareBoundingClientRect(
          gridBoundingClientRect,
          el
        ),
      }))
      .filter(({ el, boundingClientRect }) => {
        const cachedData = cachedPositionData[el.dataset[DATASET_KEY]];
        // don't animate the initial appearance of elements,
        // just cache their position so they can be animated later
        if (!cachedData) {
          recordPositions([el]);
          return false;
        } else if (
          boundingClientRect.top === cachedData.rect.top &&
          boundingClientRect.left === cachedData.rect.left &&
          boundingClientRect.width === cachedData.rect.width &&
          boundingClientRect.height === cachedData.rect.height
        ) {
          return true;
        } else if (
          !rectInViewport(boundingClientRect, gridBoundingClientRect) &&
          !rectInViewport(cachedData.rect, gridBoundingClientRect)
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

        const cachedData = cachedPositionData[el.dataset[DATASET_KEY]];

        const { top, left, width, height } = boundingClientRect;

        const coords = {};

        coords.scaleX = cachedData.rect.width / width;
        coords.scaleY = cachedData.rect.height / height;
        coords.translateX = cachedData.rect.left - left;
        coords.translateY = cachedData.rect.top - top;

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
            // this is necessary for interruptible animations
            requestAnimationFrame(() => {
              recordPositions([el]);
            });
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
              delete cachedData.tween;
            }
          });

        if (stagger) tween.delay(duration / gridItems.length * i);

        tween.start();
        cachedData.tween = tween;
      });

    // now, start all the animations
    const animate = time => {
      if (TWEEN.getAll().every(t => !t.isPlaying())) return;
      requestAnimationFrame(animate);
      TWEEN.update(time);
    };
    requestAnimationFrame(animate);
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
