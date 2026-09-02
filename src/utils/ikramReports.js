function itemProductLabel(item) {
  return item.productName || item.categoryName;
}

function itemVarietyLabel(item) {
  return `${itemProductLabel(item)} – ${item.variationName}`;
}

export function flattenIkramRows(filteredIkrams) {
  const rows = [];

  for (const ikram of filteredIkrams) {
    for (const item of ikram.items) {
      rows.push({
        ikramId: ikram.id,
        timestamp: ikram.timestamp,
        recipient: ikram.recipient?.trim() || 'Belirtilmedi',
        categoryName: item.categoryName,
        productName: itemProductLabel(item),
        variationName: item.variationName,
        quantity: item.quantity,
        note: ikram.note?.trim() || '',
        username: ikram.username || '',
      });
    }
  }

  return rows.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

export function analyzeIkramByRecipient(filteredIkrams) {
  const rows = flattenIkramRows(filteredIkrams);
  const byPerson = new Map();

  for (const row of rows) {
    if (!byPerson.has(row.recipient)) {
      byPerson.set(row.recipient, {
        name: row.recipient,
        totalItems: 0,
        products: new Map(),
        entries: [],
      });
    }

    const person = byPerson.get(row.recipient);
    person.totalItems += row.quantity;
    const label = `${row.productName} – ${row.variationName}`;
    person.products.set(label, (person.products.get(label) || 0) + row.quantity);
    person.entries.push(row);
  }

  const people = [...byPerson.values()]
    .map((person) => ({
      name: person.name,
      totalItems: person.totalItems,
      products: [...person.products.entries()]
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
      entries: person.entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
    }))
    .sort((a, b) => b.totalItems - a.totalItems);

  return {
    uniquePeople: people.length,
    totalItems: rows.reduce((sum, row) => sum + row.quantity, 0),
    tableRows: rows,
    people,
  };
}

export function buildIkramRecipientsFromHistory(ikrams, existing = []) {
  const set = new Set(existing);
  for (const ikram of ikrams) {
    const name = ikram.recipient?.trim();
    if (name) set.add(name);
  }
  return [...set].sort((a, b) => a.localeCompare(b, 'tr'));
}
