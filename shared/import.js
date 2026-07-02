import { validateCapsule } from './capsule.js';

const KNOWN_ARRAY_FIELDS = ['goals', 'constraints', 'stack', 'keyDecisions', 'rawTurns'];

function toStringArray(value) {
  if (!Array.isArray(value)) return [];
  return value.filter(item => typeof item === 'string').map(item => item.trim()).filter(Boolean);
}

function normalizeTurns(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter(turn => turn && typeof turn === 'object')
    .map(turn => ({
      role: turn.role === 'assistant' ? 'assistant' : 'user',
      text: typeof turn.text === 'string' ? turn.text.trim() : '',
    }))
    .filter(turn => turn.text);
}

function normalizeCapsule(input) {
  if (!input || typeof input !== 'object') return null;

  const content = input.content && typeof input.content === 'object' ? input.content : {};
  const meta = input.meta && typeof input.meta === 'object' ? input.meta : {};
  const capturedAt = Number(input.capturedAt);
  const updatedAt = Number(input.updatedAt);

  const normalized = {
    id: typeof input.id === 'string' ? input.id.trim() : '',
    title: typeof input.title === 'string' ? input.title.trim() : '',
    source: typeof input.source === 'string' ? input.source.trim() : '',
    url: typeof input.url === 'string' ? input.url.trim() : '',
    capturedAt,
    updatedAt: Number.isFinite(updatedAt) ? updatedAt : capturedAt,
    content: {
      summary: typeof content.summary === 'string' ? content.summary.trim() : '',
      goals: toStringArray(content.goals),
      constraints: toStringArray(content.constraints),
      stack: toStringArray(content.stack),
      keyDecisions: toStringArray(content.keyDecisions),
      rawTurns: normalizeTurns(content.rawTurns),
      rawSnippet: typeof content.rawSnippet === 'string' ? content.rawSnippet.trim() : '',
    },
    meta: {
      tags: toStringArray(meta.tags),
      folder: typeof meta.folder === 'string' && meta.folder.trim() ? meta.folder.trim() : null,
      pinned: meta.pinned === true,
      enriched: meta.enriched === true,
    },
  };

  for (const field of KNOWN_ARRAY_FIELDS) {
    if (!Array.isArray(normalized.content[field])) normalized.content[field] = [];
  }

  return normalized;
}

export function extractCapsulesFromImport(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === 'object' && Array.isArray(payload.capsules)) {
    return payload.capsules;
  }
  return null;
}

export function prepareCapsuleImport(payload, existingCapsules = []) {
  const rawCapsules = extractCapsulesFromImport(payload);
  const stats = {
    total: Array.isArray(rawCapsules) ? rawCapsules.length : 0,
    imported: 0,
    duplicate: 0,
    invalid: 0,
  };

  if (!rawCapsules) {
    return { capsules: [], stats, error: 'Import file must contain a capsule array.' };
  }

  const seenIds = new Set(
    existingCapsules
      .map(capsule => capsule?.id)
      .filter(id => typeof id === 'string' && id.trim())
  );
  const capsules = [];

  for (const rawCapsule of rawCapsules) {
    const capsule = normalizeCapsule(rawCapsule);
    const validation = validateCapsule(capsule);

    if (!validation.valid) {
      stats.invalid += 1;
      continue;
    }

    if (seenIds.has(capsule.id)) {
      stats.duplicate += 1;
      continue;
    }

    seenIds.add(capsule.id);
    capsules.push(capsule);
    stats.imported += 1;
  }

  return { capsules, stats };
}
