// Tailwind v4: el pipeline lo orquesta Next.js; este archivo declara el scope de
// los archivos a escanear. Los tokens del diseño los ponemos en CSS ("@theme").
import type { Config } from 'tailwindcss';

export default {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;
