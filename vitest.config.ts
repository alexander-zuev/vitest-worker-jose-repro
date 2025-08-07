import { defineConfig } from 'vitest/config';
import { defineWorkersProject } from '@cloudflare/vitest-pool-workers/config';

export default defineConfig({
  test: {
    projects: [
      defineWorkersProject({
        test: {
          name: 'worker-integration',
          include: ['tests/**/*.test.ts'],
          setupFiles: [],
          globals: true,
                deps: {
        optimizer: {
        ssr: {
          enabled: true,
          include: ['better-auth'],
        },
        },
        },
          poolOptions: {
            workers: {
              singleWorker: true,
              isolatedStorage: false,
              miniflare: {
                compatibilityFlags: ['nodejs_compat'],
                compatibilityDate: '2025-06-17',
              },
              wrangler: {
                configPath: './wrangler.jsonc',
              },
            },
          },
        },
      }),
    ],
  },
});