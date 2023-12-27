/**
 * Configuration for the global end-to-end testing,
 * placed in the project's root 'tests' folder.
 * @type {import('vite').UserConfig}
 * @see https://vitest.dev/config/
 */
const config = {
  test: {
    include: ['./tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
};

export default config;
