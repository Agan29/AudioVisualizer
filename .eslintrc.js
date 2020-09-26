/*
 * @Date: 2020-09-08 17:25:42
 * @LastEditors: Agan
 * @LastEditTime: 2020-09-26 22:08:35
 * @FilePath: /Coder/my-app/.eslintrc.js
 * @Description:
 */
module.exports = {
  extends: 'react-app',
  env: {
    browser: true,
    node: true,
    es6: true
  },
  plugins: ['react', 'prettier/recommended', 'react-hooks'],
  parser: 'babel-eslint', // include eslint-plugin-import
  parserOptions: {
    ecmaVersion: 7,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
      modules: true
    }
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        },

        // typescript-eslint specific options
        warnOnUnsupportedTypeScriptVersion: true
      },
      plugins: ['@typescript-eslint'],
      rules: {
        '@typescript-eslint/no-unused-vars': [2, { args: 'none' }],
        'no-unused-expressions': 'off',
        '@typescript-eslint/no-unused-expressions': 2
      }
    },
    {
      files: ['*.md'],
      globals: {
        React: true,
        ReactDOM: true,
        mountNode: true
      },
      rules: {
        indent: 0,
        'no-unused-vars': 0,
        'no-console': 0,
        'no-plusplus': 0,
        'eol-last': 0,
        'no-script-url': 0,
        'prefer-rest-params': 0,
        'react/no-access-state-in-setstate': 0,
        'react/destructuring-assignment': 0,
        'react/no-multi-comp': 0,
        'jsx-a11y/href-no-hash': 0,
        'import/no-extraneous-dependencies': 0,
        'jsx-a11y/control-has-associated-label': 0
      }
    }
  ],
  rules: {
    'no-unused-vars': 0,
    // off
    // "no-use-before-define": 0,
    'no-console': 0
    // "no-alert": 0,
    // "no-plusplus": 0,
    // "no-unused-expressions": 0,
    // "func-names": 0,
    // "eqeqeq": 0,
    // "no-underscore-dangle": 0,
    // "no-param-reassign": 0,
    // "no-new": 0,
    // "import/no-unresolved": 0,
    // "import/no-extraneous-dependencies": 0,
    // "linebreak-style": 0,
    // "no-nested-ternary": 0,
    // "arrow-body-style": 0,
    // "prefer-const": 0,
    // // warn
    // "import/prefer-default-export": 1,
    // "no-unused-vars": 1,
    // // error
    // indent: [ 2, 4, {
    //     SwitchCase: 1,
    //     VariableDeclarator: 1,
    //     outerIIFEBody: 1,
    //     FunctionDeclaration: {
    //         parameters: 1,
    //         body: 1,
    //     },
    //     FunctionExpression: {
    //         parameters: 1,
    //         body: 1,
    //     },
    // } ],
    // "space-before-function-paren": [ 2, "never" ],
    // "wrap-iife": [ 2, "inside", {
    //     functionPrototypeMethods: true
    // } ],
    // "max-len": [ 2, 120, 4, {
    //     ignoreUrls: true,
    //     ignoreComments: false,
    //     ignoreRegExpLiterals: true,
    //     ignoreStrings: true,
    //     ignoreTemplateLiterals: true,
    // } ],
    // // react
    // "react/jsx-uses-react": 2,
    // "react/jsx-uses-vars": 2,
    // "react-hooks/rules-of-hooks": 2,
    // 使用后会添加不希望出现的变量到依赖
    //
    // "react-hooks/exhaustive-deps": 1,
    // // no debugger
    // "no-debugger": 2,
  }
}
