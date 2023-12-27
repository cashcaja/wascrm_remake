import {expect, test} from 'vitest';
import {versions} from '../src';

test('versions', async () => {
  expect(versions).toBe(process.versions);
});
