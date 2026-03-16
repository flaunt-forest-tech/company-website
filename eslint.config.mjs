import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypeScript from 'eslint-config-next/typescript';

const eslintConfig = [
  {
    ignores: ['.next/**', 'public/**', 'src/vendor/**', '**/vendor/**'],
  },
  ...nextCoreWebVitals,
  ...nextTypeScript,
];

export default eslintConfig;
