export async function loadTrophyData() {
  const response = await fetch('data/trophies.json');
  if (!response.ok) throw new Error(`Trophy data could not be loaded (${response.status}).`);
  const data = await response.json();
  if (!Array.isArray(data.trophies) || data.trophies.length !== 55) {
    throw new Error('The trophy reference must contain all 55 entries.');
  }
  return data;
}
