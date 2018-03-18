import { wrapGrid } from '../src/index.js';

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

const { unwrapGrid } = wrapGrid(grid);

document
  .querySelector('.js-remove-listener')
  .addEventListener('click', unwrapGrid);

// ========================================================
// accordion test
// ========================================================

const subjects = document.querySelector('.subjects');

// animate the grid
const { unwrapGridSubjects } = wrapGrid(subjects, { easing: 'Linear.None' });

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

// event handler to toggle card size on click
const changeGrid = document.querySelector('.grid-children-change');
setInterval(()=>{
  [...changeGrid.querySelectorAll('.card')].forEach((el)=>{
    const width = Math.random() * 400;
      const height = Math.random() * 200;
    el.innerHTML = `<div class="card__inner" style="width:${width}px; height:${height}px"></div>`
  })
}, 1000)


const { unwrapChangeGrid } = wrapGrid(changeGrid);


