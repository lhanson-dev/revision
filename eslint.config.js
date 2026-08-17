import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'

const files = ['src/**/*.{ts,tsx}', 'vite.config.ts']

export default tseslint.config(
  { ignores: ['dist/**', 'subjects/**'] },
  ...tseslint.configs.recommended.map((config) => ({ ...config, files })),
  {
    files,
    plugins: {
      'react-hooks': reactHooks,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.nodeBuiltin,
      },
    },
    rules: reactHooks.configs.flat.recommended.rules,
  },
)
