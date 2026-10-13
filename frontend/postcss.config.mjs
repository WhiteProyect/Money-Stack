/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    // Tailwind v4: plugin oficial; procesa @theme y genera las utilidades.
    // (autoprefixer lo aplica Tailwind internamente con Lightning CSS)
    '@tailwindcss/postcss': {},
  },
};

export default config;
