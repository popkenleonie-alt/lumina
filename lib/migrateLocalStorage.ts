export async function migrateLocalStorageToDB() {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem('lumina-migrated-to-db')) return;

  let migrated = false;

  // Migrate day data
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (
      key?.startsWith('lumina-journal-') &&
      key !== 'lumina-journal-custom-sections'
    ) {
      const dateKey = key.replace('lumina-journal-', '');
      const raw = localStorage.getItem(key);
      if (raw) {
        try {
          const data = JSON.parse(raw);
          await fetch('/api/journal', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dateKey, data }),
          });
          migrated = true;
        } catch {
          // skip invalid entries
        }
      }
    }
  }

  // Migrate custom sections
  const sections = localStorage.getItem('lumina-journal-custom-sections');
  if (sections) {
    try {
      const parsed = JSON.parse(sections);
      await fetch('/api/journal/custom-sections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      });
      migrated = true;
    } catch {
      // skip
    }
  }

  if (migrated) {
    localStorage.setItem('lumina-migrated-to-db', 'true');
  }
}
