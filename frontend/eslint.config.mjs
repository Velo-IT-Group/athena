import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'
import pluginQuery from '@tanstack/eslint-plugin-query'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
    baseDirectory: __dirname,
    allConfig: {
        rules: {
            semi: 'error',
            'no-empty-interface': 'error',
            'no-use-before-define': 'error',
        },
    },
})

const eslintConfig = [
    ...compat.extends(),
    ...pluginQuery.configs['flat/recommended'],
]

export default eslintConfig
