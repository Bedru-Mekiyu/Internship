export default {
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    css: true,
    pool: 'threads',
    exclude: [
      'e2e/**',
      'node_modules/**',
      'dist/**',
      'coverage/**',
    ],
  },
};
