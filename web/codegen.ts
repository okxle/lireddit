
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: "http://localhost:4000/graphql",
  documents: ['src/**/*.tsx'],
  generates: {
    "src/generated/": {
      preset: "client",
      plugins: [],
    }
  },
  ignoreNoDocuments: true,
};

export default config;
