/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "ui-serif", "Georgia", "serif"]
      },
      colors: {
        base: "#F9F8FF",
        offWhite: "#F9F8FF",
        section: "#FFFFFF",
        accentPrimary: "#1A1A3E",
        accentSecondary: "#C9A84C",
        accent: "#6C3FC5",
        highlight: "#E7E3F7",
        muted: "#E7E3F7",
        ink: "#1A1A1A",
        primary: "#1A1A3E",
        secondary: "#C9A84C",
        text: "#1A1A1A",
        divider: "#E7E3F7",
        background: "#F9F8FF"
      },
      backgroundImage: {
        "camliqa-mesh":
          "radial-gradient(45% 52% at 15% 18%, rgba(201,168,76,0.22) 0%, rgba(201,168,76,0) 65%), radial-gradient(65% 75% at 84% 76%, rgba(108,63,197,0.18) 12%, rgba(108,63,197,0) 62%), linear-gradient(120deg, rgba(26,26,62,0.08) 0%, rgba(249,248,255,1) 55%, rgba(26,26,62,0.06) 100%)"
      },
      boxShadow: {
        soft: "0 24px 55px -28px rgba(26,26,62,0.22)",
        card: "0 20px 42px -24px rgba(201,168,76,0.22)"
      },
      borderRadius: {
        xl2: "1rem",
        xl3: "1.25rem"
      }
    }
  },
  plugins: []
};
