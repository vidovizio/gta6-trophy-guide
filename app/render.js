const FILTERS = [
  { value: 'all', label: 'All trophies', icon: '◈' },
  { value: 'story', label: 'Story', icon: '▸' },
  { value: 'missable', label: 'Missable', icon: '!' },
  { value: 'collectible', label: 'Collectibles', icon: '◇' },
  { value: 'activity', label: 'Activities', icon: '↗' },
  { value: 'online', label: 'Online', icon: '◎' }
];

function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function isSpoilerLocked(trophy, state) {
  return state.spoilers && trophy.kind === 'story' && !state.earned.has(trophy.name);
}

function makeGradeBadge(grade) {
  const badge = makeElement('span', 'grade-badge', grade);
  badge.dataset.grade = grade;
  return badge;
}

function makeTrophyRow(trophy, state, selected, onSelect, onToggleEarned) {
  const row = makeElement('article', `trophy-row${selected ? ' selected' : ''}`);
  row.tabIndex = 0;
  row.setAttribute('role', 'button');
  row.setAttribute('aria-label', `Open trophy ${trophy.id}`);
  const earnedButton = makeElement('button', `earned-button${state.earned.has(trophy.name) ? ' earned' : ''}`, '✓');
  earnedButton.type = 'button';
  earnedButton.title = state.earned.has(trophy.name) ? 'Mark unearned' : 'Mark earned';
  earnedButton.setAttribute('aria-label', earnedButton.title);
  earnedButton.addEventListener('click', event => {
    event.stopPropagation();
    onToggleEarned(trophy);
  });
  const text = makeElement('div', 'trophy-text');
  if (isSpoilerLocked(trophy, state)) {
    text.append(makeElement('div', 'trophy-name masked-name', `Story trophy · ${String(trophy.id).padStart(2, '0')}`));
    text.append(makeElement('div', 'trophy-description', 'Name and requirement hidden until earned.'));
  } else {
    text.append(makeElement('div', 'trophy-name', trophy.name));
    text.append(makeElement('div', 'trophy-description', trophy.description));
  }
  row.append(earnedButton, text, makeGradeBadge(trophy.grade));
  row.addEventListener('click', () => onSelect(trophy.id));
  row.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect(trophy.id);
    }
  });
  return row;
}

function makeMaskedPreview(trophies, state) {
  const preview = makeElement('div', 'masked-preview');
  const heading = makeElement('strong', '', 'STORY SPOILERS STAY COVERED');
  const note = makeElement('p', '', 'These story entries are outside the current filter. Names and descriptions stay hidden until earned.');
  preview.append(heading, note);
  trophies.filter(trophy => trophy.kind === 'story' && !state.earned.has(trophy.name)).slice(0, 3).forEach(trophy => {
    preview.append(makeElement('div', 'masked-preview-row', `•••  Story entry ${String(trophy.id).padStart(2, '0')} · ${trophy.grade}`));
  });
  return preview;
}

function renderSourceLinks(sources, container) {
  const title = makeElement('div', 'sources-title', 'REFERENCE LINKS');
  container.append(title);
  sources.forEach(source => {
    const link = makeElement('a', 'source-link', source.name);
    link.href = source.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    container.append(link);
  });
  container.append(makeElement('p', 'source-limit', 'The trophy-list pages were not reachable during research (empty response / 403). No specific guide method was verified; notes above stick to the supplied official wording.'));
}

export function renderFilters(container, trophies, selectedKind, onFilter) {
  container.replaceChildren();
  FILTERS.forEach(filter => {
    const count = filter.value === 'all'
      ? trophies.length
      : filter.value === 'missable'
        ? trophies.filter(trophy => trophy.missable).length
        : trophies.filter(trophy => trophy.kind === filter.value).length;
    const button = makeElement('button', `filter-option${selectedKind === filter.value ? ' active' : ''}`);
    button.type = 'button';
    button.setAttribute('aria-pressed', String(selectedKind === filter.value));
    const icon = makeElement('span', 'filter-icon', filter.icon);
    const label = makeElement('span', '', filter.label);
    const total = makeElement('span', 'filter-total', String(count).padStart(2, '0'));
    button.append(icon, label, total);
    button.addEventListener('click', () => onFilter(filter.value));
    container.append(button);
  });
}

export function renderProgress(trophies, earned) {
  const earnedCount = trophies.filter(trophy => earned.has(trophy.name)).length;
  document.getElementById('progress-label').innerHTML = `${earnedCount} <small>/ ${trophies.length} earned</small>`;
  document.getElementById('progress-fill').style.width = `${earnedCount / trophies.length * 100}%`;
  const counts = document.getElementById('grade-counts');
  counts.replaceChildren();
  ['platinum', 'gold', 'silver', 'bronze'].forEach(grade => {
    const total = trophies.filter(trophy => trophy.grade === grade).length;
    const complete = trophies.filter(trophy => trophy.grade === grade && earned.has(trophy.name)).length;
    const item = makeElement('span', 'grade-count');
    item.dataset.grade = grade;
    item.append(makeElement('i', 'grade-dot'), makeElement('b', '', `${complete}/${total}`), document.createTextNode(grade));
    counts.append(item);
  });
}

export function renderTrophyList(container, trophies, visible, state, selectedId, onSelect, onToggleEarned) {
  container.replaceChildren();
  if (!visible.length) {
    const message = makeElement('div', 'empty-list');
    message.append(makeElement('strong', '', state.kind === 'missable' ? 'No confirmed missables' : 'No matches in this view'));
    message.append(document.createTextNode(state.kind === 'missable'
      ? 'No accessible source verified a permanently missable requirement. This filter intentionally stays empty rather than guessing.'
      : 'Try a different search or filter.'));
    container.append(message);
    if (state.kind === 'missable' && state.spoilers) container.append(makeMaskedPreview(trophies, state));
    return;
  }
  visible.forEach(trophy => {
    container.append(makeTrophyRow(trophy, state, selectedId === trophy.id, onSelect, onToggleEarned));
  });
}

export function renderDetail(container, trophy, state) {
  container.replaceChildren();
  if (!trophy) {
    container.append(makeElement('p', 'detail-error', 'Select a trophy to open its field notes.'));
    return;
  }
  const top = makeElement('div', 'detail-top');
  top.append(makeElement('span', '', 'FIELD NOTE / TROPHY'));
  top.append(makeElement('span', 'detail-index', `${String(trophy.id).padStart(2, '0')} / 55`));
  container.append(top);
  const body = makeElement('div', 'detail-body');
  const locked = isSpoilerLocked(trophy, state);
  if (locked) {
    body.append(makeElement('div', 'detail-kicker', 'STORY SPOILER LOCKED'));
    body.append(makeElement('h3', '', `Story trophy ${String(trophy.id).padStart(2, '0')}`));
    body.append(makeElement('p', 'detail-guide locked-copy', 'Earn this trophy or turn off Story spoilers to reveal its official name, description, and guide.'));
    container.append(body);
    return;
  }
  body.append(makeElement('div', 'detail-kicker', trophy.stage));
  body.append(makeElement('h3', '', trophy.name));
  body.append(makeElement('p', 'detail-description', trophy.description));
  const gradeLine = makeElement('div', 'detail-grade-line');
  gradeLine.append(makeGradeBadge(trophy.grade));
  if (trophy.missable) gradeLine.append(makeElement('span', 'flag alert', 'MISSABLE'));
  else gradeLine.append(makeElement('span', 'flag neutral', 'NO MISSABLE CONDITION VERIFIED'));
  body.append(gradeLine);
  const guide = makeElement('div', 'detail-guide');
  guide.append(makeElement('p', '', trophy.guide));
  const steps = makeElement('ol', 'step-list');
  trophy.steps.forEach(step => steps.append(makeElement('li', '', step)));
  guide.append(steps);
  const sources = makeElement('div', 'sources');
  renderSourceLinks(trophy.sources, sources);
  guide.append(sources);
  body.append(guide);
  container.append(body);
}

export function setActiveFilterLabel(kind) {
  const labels = Object.fromEntries(FILTERS.map(filter => [filter.value, filter.label.toUpperCase()]));
  document.getElementById('active-filter-label').replaceChildren(
    document.createTextNode(labels[kind] ?? 'ALL TROPHIES '),
    makeElement('span', '', '↘')
  );
  document.getElementById('visible-count').textContent = kind === 'missable' ? '0' : '';
}
