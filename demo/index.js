import { wrapGrid } from '../src/index.ts';

const grid = document.querySelector('.grid');

document
  .querySelector('.js-toggle-grid')
  .addEventListener('click', () => grid.classList.toggle('grid--full'));

document.querySelector('.js-add-card').addEventListener('click', () => {
  const randomNumber = Math.floor(Math.random() * 5) + 1;
  grid.insertAdjacentHTML(
    'beforeend',
    `
      <div class="card card--${randomNumber}">
      <div>
        <div class="card__avatar"></div>
        <div class="card__title"></div>
        <div class="card__description"></div>
      </div>
    </div>
    `
  );
});

grid.addEventListener('click', ev => {
  let target = ev.target;
  while (target.tagName !== 'HTML') {
    if (target.classList.contains('card')) {
      target.classList.toggle('card--expanded');
      return;
    }
    target = target.parentElement;
  }
});

const { unwrapGrid } = wrapGrid(grid, {
  easing: 'backOut',
  onStart: els => console.log('onstart', els),
  onEnd: els => console.log('onend', els),
  watchScroll: true,
});

document
  .querySelector('.js-remove-listener')
  .addEventListener('click', unwrapGrid);

// // ========================================================
// // accordion test
// // ========================================================

const subjects = document.querySelector('.subjects');

// animate the grid
const { unwrapGridSubjects } = wrapGrid(subjects, { easing: 'linear' });

// add a click handler
subjects.addEventListener('click', ev => {
  [...document.querySelectorAll('.subject')].forEach(el =>
    el.classList.remove('subject--active')
  );
  let target = ev.target;
  while (target.tagName !== 'HTML') {
    if (target.classList.contains('subject')) {
      target.classList.toggle('subject--active');
      return;
    }
    target = target.parentElement;
  }
});

// ========================================================
// children change
// ========================================================

const changeGrid = document.querySelector('.grid-children-change');
const { unwrapChangeGrid, forceGridAnimation } = wrapGrid(changeGrid);

const updateContents = () => {
  [...changeGrid.querySelectorAll('.card')].forEach(el => {
    const width = Math.random() * 300;
    const height = Math.random() * 200;
    const inner = el.querySelector('.card__inner');
    inner.style.width = `${width}px`;
    inner.style.height = `${height}px`;
  });
  forceGridAnimation();
};

setInterval(updateContents, 2000);

// ========================================================
// nested grid
// ========================================================

const addCard = container => i => {
  const randomNumber = Math.floor(Math.random() * 5) + 1;
  container.insertAdjacentHTML(
    'beforeend',
    `
      <div class="card card--${randomNumber}">
      <div></div>
    </div>
    `
  );
};

const nestedGrid = document.querySelector('.nested-grid');
[...Array(400).keys()].forEach(addCard(nestedGrid));

wrapGrid(nestedGrid, { duration: 300 });

nestedGrid.addEventListener('click', ev => {
  let target = ev.target;
  while (target.tagName !== 'HTML') {
    if (target.classList.contains('card')) {
      target.classList.toggle('card--expanded');
      return;
    }
    target = target.parentElement;
  }
});

// ========================================================
// hidden cards grid
// ========================================================

const hiddenCardGrid = document.querySelector('.hidden-cards-grid');

document
  .querySelector('.js-toggle-grid')
  .addEventListener('click', () =>
    hiddenCardGrid.classList.toggle('grid--full')
  );

document.querySelector('.js-hide-button').addEventListener('click', () => {
  [...hiddenCardGrid.querySelectorAll('.card')].forEach(el =>
    el.classList.remove('card--hidden')
  );
});

document.querySelector('.js-add-card').addEventListener('click', () => {
  const randomNumber = Math.floor(Math.random() * 5) + 1;
  hiddenCardGrid.insertAdjacentHTML(
    'beforeend',
    `
      <div class="card card--${randomNumber}">
      <div>
        <div class="card__avatar"></div>
        <div class="card__title"></div>
        <div class="card__description"></div>
      </div>
    </div>
    `
  );
});

hiddenCardGrid.addEventListener('click', ev => {
  let target = ev.target;
  while (target.tagName !== 'HTML') {
    if (target.classList.contains('card')) {
      target.classList.toggle('card--hidden');
      return;
    }
    target = target.parentElement;
  }
});

wrapGrid(hiddenCardGrid, { stagger: 20, easing: 'backOut', duration: 10000 });
