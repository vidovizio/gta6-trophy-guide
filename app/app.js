import { loadTrophyData } from './data.js';
import { createInitialState, downloadProgress, readEarnedNames, readProgressFile, saveEarnedNames, visibleTrophies } from './state.js';
import { renderDetail, renderFilters, renderProgress, renderTrophyList, setActiveFilterLabel } from './render.js';
import { renderRoadmap } from './roadmap.js';

const screenshotMode = new URLSearchParams(location.search).get('shot');
const screenshotNames = new Set(['checklist', 'guide', 'roadmap', 'filters']);
const isScreenshot = screenshotNames.has(screenshotMode);

function showError(message) {
  document.getElementById('detail-panel').replaceChildren();
  const error = document.createElement('p');
  error.className = 'detail-error';
  error.textContent = message;
  document.getElementById('detail-panel').append(error);
}

function renderApp(trophies, state) {
  const visible = visibleTrophies(trophies, state);
  renderProgress(trophies, state.earned);
  renderFilters(document.getElementById('kind-filters'), trophies, state.kind, kind => {
    state.kind = kind;
    renderApp(trophies, state);
  });
  renderTrophyList(document.getElementById('trophy-list'), trophies, visible, state, state.selectedId, id => {
    state.selectedId = id;
    renderApp(trophies, state);
  }, trophy => {
    if (state.earned.has(trophy.name)) state.earned.delete(trophy.name);
    else state.earned.add(trophy.name);
    if (!isScreenshot) saveEarnedNames(state.earned);
    renderApp(trophies, state);
  });
  const selected = trophies.find(trophy => trophy.id === state.selectedId);
  renderDetail(document.getElementById('detail-panel'), selected, state);
  setActiveFilterLabel(state.kind);
  document.getElementById('visible-count').textContent = String(visible.length);
  document.getElementById('search').value = state.search;
  document.getElementById('spoiler').checked = state.spoilers;
}

async function startGuide() {
  try {
    const data = await loadTrophyData();
    const shot = isScreenshot ? screenshotMode : '';
    const state = createInitialState(readEarnedNames(), shot);
    renderApp(data.trophies, state);
    renderRoadmap(document.getElementById('roadmap-stages'), data.trophies, kind => {
      state.kind = kind;
      renderApp(data.trophies, state);
      document.getElementById('checklist').scrollIntoView();
    });
    document.getElementById('search').addEventListener('input', event => {
      state.search = event.target.value;
      renderApp(data.trophies, state);
    });
    document.getElementById('spoiler').addEventListener('change', event => {
      state.spoilers = event.target.checked;
      renderApp(data.trophies, state);
    });
    document.getElementById('export').addEventListener('click', () => downloadProgress(state.earned));
    document.getElementById('import-file').addEventListener('change', async event => {
      const file = event.target.files[0];
      if (!file) return;
      try {
        state.earned = await readProgressFile(file, new Set(data.trophies.map(trophy => trophy.name)));
        saveEarnedNames(state.earned);
        renderApp(data.trophies, state);
      } catch (error) {
        window.alert(error.message);
      }
      event.target.value = '';
    });
    document.getElementById('roadmap-link').addEventListener('click', () => {
      document.getElementById('roadmap').scrollIntoView({ behavior: 'smooth' });
    });
    if (shot === 'guide') {
      const row = document.querySelector('.trophy-row.selected');
      if (row) {
        const list = document.getElementById('trophy-list');
        list.scrollTop += row.getBoundingClientRect().top - list.getBoundingClientRect().top;
      }
    }
    if (shot === 'roadmap') document.body.classList.add('shot-roadmap');
    if (shot) document.body.classList.add('shot-mode');
    window.__shotReady = true;
  } catch (error) {
    showError(error.message);
    if (isScreenshot) window.__shotReady = true;
  }
}

startGuide();
