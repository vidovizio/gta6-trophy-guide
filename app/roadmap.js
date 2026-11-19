const ROUTE = [
  {
    title: 'Story chapters',
    description: 'Clear the opening and Chapters 1–4 in order. Story milestones and named missions are grouped here.',
    filter: 'story',
    stages: ['Opening · Gone Fishing', 'Chapters 1–4', 'Named story missions', 'Stranger strands']
  },
  {
    title: 'Missable check',
    description: 'Pause before any finale or point of no return. No trophy is confirmed missable by the sources reachable for this build.',
    filter: 'missable',
    stages: ['No verified missables']
  },
  {
    title: 'Collectibles',
    description: 'Sweep the map-facing totals after story access is open: sets, locations, vehicles, and properties.',
    filter: 'collectible',
    stages: ['Meditation · 18 spots', 'Card sets · 3', 'WAiNK It · 100 locations', 'Explore · 52 areas']
  },
  {
    title: 'Activities',
    description: 'Work through repeatable challenges, races, ranges, side activities, and robbery conditions.',
    filter: 'activity',
    stages: ['Range · 42 gold medals', 'Races · 20 different wins', 'Stunts · 250', 'Challenges · 50']
  },
  {
    title: 'Cleanup & platinum',
    description: 'Use the tracker for remaining one-off requirements, cumulative totals, and the final completion sweep.',
    filter: 'all',
    stages: ['100% completion', 'Cryptic hints', 'Final trophy']
  }
];

export function renderRoadmap(container, trophies, onFilter) {
  container.replaceChildren();
  ROUTE.forEach((stage, index) => {
    const card = document.createElement('article');
    card.className = 'route-card';
    const number = document.createElement('div');
    number.className = 'route-number';
    number.textContent = `PHASE 0${index + 1}`;
    const heading = document.createElement('h3');
    heading.textContent = stage.title;
    const description = document.createElement('p');
    description.textContent = stage.description;
    const count = document.createElement('div');
    count.className = 'route-count';
    const total = stage.filter === 'missable'
      ? trophies.filter(item => item.missable).length
      : stage.filter === 'all'
        ? trophies.length
        : trophies.filter(item => item.kind === stage.filter).length;
    const amount = document.createElement('strong');
    amount.textContent = String(total);
    count.append(amount, document.createTextNode(` tracked · ${stage.stages.join(' / ')}`));
    card.append(number, heading, description, count);
    card.addEventListener('click', () => onFilter(stage.filter));
    card.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onFilter(stage.filter);
      }
    });
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `Filter checklist: ${stage.title}`);
    container.append(card);
  });
}
