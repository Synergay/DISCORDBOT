function parseSections(text) {
  const sections = {};
  let current = null;
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const match = trimmed.match(/^\[(.+)\]$/);
    if (match) {
      current = match[1].trim();
      sections[current] = [];
    } else if (current) {
      sections[current].push(trimmed);
    }
  }
  return sections;
}

function toSectionText(sections) {
  const parts = [];
  for (const [name, items] of Object.entries(sections)) {
    parts.push(`[${name}]`);
    parts.push(...items);
    parts.push("");
  }
  return parts.join("\n").trim();
}

function parseFlat(text) {
  return text.split("\n").map(l => l.trim()).filter(Boolean);
}

module.exports = { parseSections, toSectionText, parseFlat };
