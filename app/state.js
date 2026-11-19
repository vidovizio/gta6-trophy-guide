const STORAGE_KEY = 'leonida-atlas-progress-v1';

export function readEarnedNames() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return new Set();
  const names = JSON.parse(saved);
  if (!Array.isArray(names) || names.some(name => typeof name !== 'string')) {
    throw new Error('Saved progress is invalid. Export it before clearing the damaged entry.');
  }
  return new Set(names);
}

export function saveEarnedNames(earnedNames) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...earnedNames]));
}

export async function readProgressFile(file, validNames) {
  const imported = JSON.parse(await file.text());
  const names = Array.isArray(imported) ? imported : imported.earned;
  if (!Array.isArray(names) || names.some(name => typeof name !== 'string')) {
    throw new Error('This file is not a LEONIDA ATLAS progress export.');
  }
  return new Set(names.filter(name => validNames.has(name)));
}

export function downloadProgress(earnedNames) {
  const payload = JSON.stringify({ app: 'LEONIDA ATLAS', version: 1, earned: [...earnedNames] }, null, 2);
  const file = new Blob([payload], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(file);
  link.download = 'leonida-atlas-progress.json';
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 0);
}

export function createInitialState(earned, shot) {
  const demoNames = new Set([
    'Just Like Paradise', 'Paradise Lost', 'Trust', 'Break the Bank',
    'Master of None', 'Stick Fiddler', 'Baited My Tackle', 'Road to Rehabilitation',
    'Positive Mental Attitude', 'In The Beginning…', 'A Classic Blitz Play'
  ]);
  if (shot === 'filters') {
    demoNames.delete('Just Like Paradise');
    demoNames.delete('Paradise Lost');
  }
  if (shot) earned = new Set(demoNames);
  return {
    earned,
    kind: shot === 'filters' ? 'missable' : 'all',
    search: '',
    spoilers: shot === 'filters',
    selectedId: shot === 'guide' ? 17 : 2
  };
}

export function visibleTrophies(trophies, state) {
  const query = state.search.trim().toLocaleLowerCase();
  return trophies.filter(trophy => {
    if (state.kind === 'missable' && !trophy.missable) return false;
    if (state.kind !== 'all' && state.kind !== 'missable' && trophy.kind !== state.kind) return false;
    if (!query) return true;
    const masked = state.spoilers && trophy.kind === 'story' && !state.earned.has(trophy.name);
    if (masked) return `story trophy ${trophy.id}`.includes(query);
    return `${trophy.name} ${trophy.description}`.toLocaleLowerCase().includes(query);
  });
}

export function gradeTotals(trophies, earned) {
  return ['platinum', 'gold', 'silver', 'bronze'].map(grade => ({
    grade,
    total: trophies.filter(trophy => trophy.grade === grade).length,
    earned: trophies.filter(trophy => trophy.grade === grade && earned.has(trophy.name)).length
  }));
}
