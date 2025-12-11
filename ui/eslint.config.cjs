const {
    defineConfig,
    globalIgnores,
} = require("eslint/config");

const globals = require("globals");
const tsParser = require("@typescript-eslint/parser");
const typescriptEslint = require("@typescript-eslint/eslint-plugin");
const react = require("eslint-plugin-react");
const prettier = require("eslint-plugin-prettier");
const js = require("@eslint/js");

const {
    FlatCompat,
} = require("@eslint/eslintrc");

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

module.exports = defineConfig([{
    languageOptions: {
        globals: {
            ...globals.browser,
        },

        parser: tsParser,
        ecmaVersion: "latest",
        sourceType: "module",

        parserOptions: {
            project: "./tsconfig.json",
            tsconfigRootDir: __dirname + "/..",
        },
    },

    extends: [
        ...compat.extends("plugin:react/recommended"),
        ...compat.extends("plugin:@typescript-eslint/recommended"),
        ...compat.extends("plugin:prettier/recommended")
    ],

    plugins: {
        "@typescript-eslint": typescriptEslint,
        react,
        prettier,
    },

    settings: {
        react: {
            version: "detect",
        },
    },

    rules: {
        "react/require-default-props": "off",

        "react/function-component-definition": [2, {
            namedComponents: ["function-declaration", "arrow-function"],
            unnamedComponents: "function-expression",
        }],

        "react/react-in-jsx-scope": "off",
        "react/jsx-props-no-spreading": "off",
        "no-console": "warn",
        "react/prop-types": "off",
        "react/jsx-uses-react": "off",
        "react/self-closing-comp": "warn",
        "react/no-array-index-key": "off",
        "import/prefer-default-export": "off",
        "no-unused-vars": "off",

        "@typescript-eslint/no-unused-vars": ["warn", {
            args: "after-used",
            ignoreRestSiblings: false,
            argsIgnorePattern: "^_.*?$",
        }],
    },
}, globalIgnores(["**/dist", "**/node_modules", "**/.eslintrc.cjs"]), globalIgnores(["**/node_modules", "**/dist", "**/tsup.config.ts", "**/.eslintrc.cjs"])]);
