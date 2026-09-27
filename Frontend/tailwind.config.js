/** @type {import('tailwindcss').Config} */
//
// Token bridge (Tailwind v3):
// Every value below points at a CSS variable in src/styles/tokens.css, so
// tokens.css stays the single hand-edited source of truth and Tailwind just
// exposes it as utilities (bg-action-primary, text-ink-muted, h-control-lg...).
// Note: v3 cannot apply opacity modifiers (bg-x/50) to var() hex colours.
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // legacy (kept for untouched Phase 1 files)
        brand: {
          purple: "var(--color-brand-purple)",
          light: "var(--color-brand-purple-light)",
        },

        // ---- Phase 2 semantic tokens ----
        action: {
          primary: "var(--color-action-primary)",
          "primary-hover": "var(--color-action-primary-hover)",
          "primary-soft": "var(--color-action-primary-soft)",
          "primary-ring": "var(--color-action-primary-ring)",
        },
        surface: {
          page: "var(--color-surface-page)",
          card: "var(--color-surface-card)",
          "field-disabled": "var(--color-surface-field-disabled)",
          "table-head": "var(--color-surface-table-head)",
        },
        line: {
          DEFAULT: "var(--color-line-default)",
          field: "var(--color-line-field)",
          "table-head": "var(--color-line-table-head)",
          card: "var(--color-line-card)",
        },
        ink: {
          primary: "var(--color-ink-primary)",
          secondary: "var(--color-ink-secondary)",
          muted: "var(--color-ink-muted)",
          "on-primary": "var(--color-ink-on-primary)",
        },
        chart: Object.fromEntries(
          [1, 2, 3, 4, 5, 6, 7].map((n) => [n, `var(--color-chart-${n})`]),
        ),
        badge: Object.fromEntries(
          ["success", "warning", "neutral", "danger", "info", "brand"].map(
            (v) => [
              v,
              {
                bg: `var(--color-badge-${v}-bg)`,
                line: `var(--color-badge-${v}-line)`,
                ink: `var(--color-badge-${v}-ink)`,
              },
            ],
          ),
        ),
        progress: {
          brand: "var(--color-progress-brand)",
          success: "var(--color-progress-success)",
          danger: "var(--color-progress-danger)",
          warning: "var(--color-progress-warning)",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        roboto: ["Roboto", "sans-serif"],
      },
      height: {
        "control-sm": "var(--size-control-sm)",
        "control-md": "var(--size-control-md)",
        "control-lg": "var(--size-control-lg)",
        "table-head": "var(--size-table-head)",
        header: "var(--size-header)",
      },
      minHeight: {
        "control-sm": "var(--size-control-sm)",
        "control-md": "var(--size-control-md)",
        "control-lg": "var(--size-control-lg)",
      },
      width: { sidebar: "var(--size-sidebar)" },
      spacing: {
        "page-x": "var(--space-page-x)",
        "page-y": "var(--space-page-y)",
      },
      borderRadius: {
        control: "var(--radius-control)",
        chip: "var(--radius-chip)",
      },
      boxShadow: { header: "var(--shadow-header)" },
    },
  },
  plugins: [],
};
