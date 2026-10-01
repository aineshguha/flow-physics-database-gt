/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0b1f33",
        graphite: "#334155",
        "gt-gold": "#B3A369",
        "gt-navy": "#003057",
        "gt-blue": "#004F9F",
        "gt-warm": "#F7F3E7",
        ocean: "#003057",
        signal: "#B3A369",
        cyan: {
          50: "#F7F3E7",
          100: "#EFE7CF",
          200: "#E6D9A8",
          300: "#B3A369",
          400: "#A4925A",
          500: "#8C7A3D",
          600: "#756428",
          700: "#594A1C",
          800: "#003057",
          900: "#00233F",
          950: "#001B33"
        }
      },
      boxShadow: {
        panel: "0 22px 70px rgba(15, 23, 42, 0.10)"
      }
    }
  },
  plugins: []
};
