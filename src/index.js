import throttle from 'lodash.throttle';
import { tween, styler, easing as popmotionEasing, delay } from 'popmotion';
import { onFrameEnd } from 'framesync';

const DATASET_KEY = 'animateGridId';

// in order to account for scroll, (which we're not listening for)
// always cache the item's position relative
// to the top and left of the grid container
const getGridAwareBoundingClientRect = (gridBoundingClientRect, el) => {
  const { top, left, width, height } = el.getBoundingClientRect();
  const rect = { top, left, width, height };
  rect.top -= gridBoundingClientRect.top;
  rect.left -= gridBoundingClientRect.left;
  return rect;
};

// the function used during the tweening
const applyCoordTransform = (el, coords, { immediate } = {}) => {
  const parentStyler = styler(el).set(coords);
  immediate && parentStyler.render();
  if (el.children[0]) {
    const childStyler = styler(el.children[0]).set({
      scaleX: 1 / coords.scaleX,
      scaleY: 1 / coords.scaleY,
    });
    immediate && childStyler.render();
  }
};

// return a function that take a reference to a grid dom node and optional config
export const wrapGrid = (
  container,
  { duration = 250, stagger = 0, easing = 'easeInOut' } = {}
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
    // stop current transitions and remove transforms on transitioning elements
    childrenElements
      .filter(el => {
        const cachedData = cachedPositionData[el.dataset[DATASET_KEY]];
        if (cachedData && cachedData.stopTween) {
          cachedData.stopTween();
          delete cachedData.stopTween;
          return true;
        }
      })
      .forEach(el => {
        el.style.transform = '';
        if (el.children[0]) {
          el.children[0].style.transform = '';
        }
      });
    const animatedGridChildren = childrenElements
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
          // if it hasn't moved, dont animate it
          return false;
        }
        return true;
      });

    // having more than one child in the animated item is not supported
    animatedGridChildren.forEach(({ el }) => {
      if ([...el.children].length > 1)
        throw new Error(
          'Make sure every grid item has a single container element surrounding its children'
        );
    });

    animatedGridChildren
      // do this measurement first so as not to cause layout thrashing
      .map(data => {
        const firstChild = data.el.children[0];
        //different transform origins give different effects. "50% 50%" is default
        if (firstChild) {
          const {
            left: childLeft,
            top: childTop,
          } = getGridAwareBoundingClientRect(
            gridBoundingClientRect,
            firstChild
          );
          data.childCoords = { childLeft, childTop };
        } else {
          data.childCoords = {};
        }
        return data;
      })
      .forEach(
        (
          {
            el,
            boundingClientRect: { top, left, width, height },
            childCoords: { childLeft, childTop },
          },
          i,
          gridItems
        ) => {
          const cachedData = cachedPositionData[el.dataset[DATASET_KEY]];
          const coords = {};
          coords.scaleX = cachedData.rect.width / width;
          coords.scaleY = cachedData.rect.height / height;
          coords.translateX = cachedData.rect.left - left;
          coords.translateY = cachedData.rect.top - top;

          el.style.transformOrigin = '0 0';
          if (childLeft === left && childTop === top)
            firstChild.style.transformOrigin = '0 0';

          applyCoordTransform(el, coords, { immediate: true });
          // now start the animation
          const startAnimation = () => {
            const { stop } = tween({
              from: coords,
              to: { translateX: 0, translateY: 0, scaleX: 1, scaleY: 1 },
              duration,
              ease: popmotionEasing[easing],
            }).start(transforms => {
              applyCoordTransform(el, transforms);
              onFrameEnd(() => recordPositions([el]));
            });
            cachedData.stopTween = stop;
          };

          if (typeof stagger !== 'number') startAnimation();
          else {
            const timeoutId = setTimeout(startAnimation, stagger * i);
            cachedData.stopTween = () => clearTimeout(timeoutId);
          }
        }
      );
  };
  const observer = new MutationObserver(mutationCallback);
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
