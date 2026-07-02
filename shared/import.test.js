import test from 'node:test';
import assert from 'node:assert/strict';
import { prepareCapsuleImport } from './import.js';

const validCapsule = {
  id: 'capsule-1',
  title: 'Routing notes',
  source: 'chatgpt',
  url: 'https://chatgpt.com/c/1',
  capturedAt: 1719000000000,
  updatedAt: 1719000000000,
  content: {
    summary: 'Debugged routing behavior.',
    goals: ['Fix redirects'],
    constraints: [],
    stack: ['Next.js'],
    keyDecisions: [],
    rawTurns: [{ role: 'user', text: 'How do I fix redirects?' }],
    rawSnippet: '[user]: How do I fix redirects?',
  },
  meta: {
    tags: ['routing'],
    folder: null,
    pinned: false,
    enriched: false,
  },
};

test('prepareCapsuleImport accepts wrapped export payloads', () => {
  const result = prepareCapsuleImport({ capsules: [validCapsule] });

  assert.equal(result.error, undefined);
  assert.equal(result.stats.imported, 1);
  assert.equal(result.capsules[0].id, 'capsule-1');
});

test('prepareCapsuleImport skips existing and repeated capsule ids', () => {
  const result = prepareCapsuleImport(
    { capsules: [validCapsule, { ...validCapsule, title: 'Duplicate' }] },
    [validCapsule]
  );

  assert.equal(result.stats.imported, 0);
  assert.equal(result.stats.duplicate, 2);
  assert.deepEqual(result.capsules, []);
});

test('prepareCapsuleImport rejects malformed capsule entries', () => {
  const result = prepareCapsuleImport({
    capsules: [
      { id: 'missing-required-fields' },
      { ...validCapsule, id: 'capsule-2', capturedAt: 'not-a-date' },
    ],
  });

  assert.equal(result.stats.invalid, 2);
  assert.equal(result.stats.imported, 0);
});

test('prepareCapsuleImport normalizes optional arrays and metadata', () => {
  const result = prepareCapsuleImport({
    capsules: [{
      ...validCapsule,
      id: 'capsule-3',
      content: {
        ...validCapsule.content,
        goals: [' Keep context ', 42, ''],
        rawTurns: [{ role: 'assistant', text: ' Done ' }, { role: 'system', text: '' }],
      },
      meta: { tags: [' ux ', null], folder: ' Research ', pinned: 1, enriched: true },
    }],
  });

  assert.equal(result.stats.imported, 1);
  assert.deepEqual(result.capsules[0].content.goals, ['Keep context']);
  assert.deepEqual(result.capsules[0].content.rawTurns, [{ role: 'assistant', text: 'Done' }]);
  assert.deepEqual(result.capsules[0].meta.tags, ['ux']);
  assert.equal(result.capsules[0].meta.folder, 'Research');
  assert.equal(result.capsules[0].meta.pinned, false);
  assert.equal(result.capsules[0].meta.enriched, true);
});

test('prepareCapsuleImport returns an error for unsupported file shapes', () => {
  const result = prepareCapsuleImport({ notCapsules: [] });

  assert.equal(result.error, 'Import file must contain a capsule array.');
  assert.equal(result.stats.total, 0);
});
