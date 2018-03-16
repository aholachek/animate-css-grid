// return a function that take a reference to a grid dom node and optional config
animateMutations = (container, { duration = 300, stagger }) => {
  // initially and after every transition, record element positions
  const recordPositions = elements => {
    [...elements].forEach(el => {
      if (typeof el.getBoundingClientRect !== 'function') return;
      const rect = el.getBoundingClientRect();
      const data = ['top', 'left', 'width', 'height'];
      data.forEach(
        d => (el.dataset[`cached${d[0].toUpperCase()}${d.slice(1)}`] = rect[d])
      );
    });
  };

  recordPositions(container.children);

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
        boundingClientRect: el.getBoundingClientRect(),
      }))
      .filter(({ el, boundingClientRect }) => {
        if (
          boundingClientRect.top !== parseInt(el.dataset.cachedTop) ||
          boundingClientRect.left !== parseInt(el.dataset.cachedLeft) ||
          boundingClientRect.width !== parseInt(el.dataset.cachedWidth) ||
          boundingClientRect.height !== parseInt(el.dataset.cachedHeight)
        ) {
          return true;
        }
        return false;
      })
      .forEach(({ el, boundingClientRect }, i, children) => {
        const { top, left, width, height } = boundingClientRect;
        const { cachedTop, cachedLeft, cachedWidth, cachedHeight } = el.dataset;

        const scaleX = parseInt(cachedWidth) / width;
        const scaleY = parseInt(cachedHeight) / height;
        const translateX = parseInt(cachedLeft) - left;
        const translateY = parseInt(cachedTop) - top;
        el.style.transition = '';
        el.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`;
        el.style.transformOrigin = '0 0';

        if ([...el.children].length > 1)
          throw new Error(
            'Make sure every grid item has a single container element surrounding its children'
          );

        if (el.children[0]) {
          el.children[0].style.transition = '';
          el.children[0].style.transform = `scale(${1 / scaleX},${1 / scaleY})`;
        }

        const transitionElement = element => {
          element.style.transition = `transform ${duration}ms ease-in-out`;
          element.style.transform = '';
        };

        const initiateAnimation = () => {
          requestAnimationFrame(() => {
            transitionElement(el);
            el.children[0] && transitionElement(el.children[0]);
            setTimeout(() => recordPositions(container.children), duration);
          });
        };

        if (stagger) {
          setTimeout(initiateAnimation, duration / children.length * i);
        } else {
          initiateAnimation();
        }
      });
  };

  const observer = new MutationObserver(mutationCallback);
  observer.observe(container, {
    childList: true,
    attributes: true,
    subtree: true,
  });
  return { stopGridAnimations: observer.disconnect };
};
