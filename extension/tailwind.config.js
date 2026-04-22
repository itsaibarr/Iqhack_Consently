/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}", "./popup.html"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#EEF3FF",
          100: "#DBE7FF",
          200: "#BFCFFF",
          400: "#6B8EF5",
          500: "#3B6BF5",
          600: "#2851D6",
          700: "#1A38A8",
        },
        accent: {
          100: "#D0F4F0",
          400: "#2CC4B8",
          500: "#14A89C",
          600: "#0E8A80",
        },
        risk: {
          amber: {
            50: "#FFFBEB",
            100: "#FEF3C7",
            400: "#F59E0B",
            500: "#D97706",
          },
          red: {
            50: "#FFF1F2",
            100: "#FFE4E6",
            400: "#F87171",
            500: "#EF4444",
            600: "#DC2626",
          },
        },
        success: {
          50: "#F0FDF4",
          100: "#DCFCE7",
          400: "#4ADE80",
          500: "#22C55E",
        },
        neutral: {
          0: "#FFFFFF",
          25: "#FAFAFA",
          50: "#F5F5F7",
          100: "#EBEBED",
          200: "#D1D1D6",
          400: "#8E8E93",
          600: "#48484A",
          800: "#1C1C1E",
          900: "#111113",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
      },
      spacing: {
        1: "4px",
        2: "8px",
        3: "12px",
        4: "16px",
        5: "20px",
        6: "24px",
        8: "32px",
        10: "40px",
        12: "48px",
        16: "64px",
      },
    },
  },
  plugins: [],
};

export default config;
