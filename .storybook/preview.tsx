import type { Preview, Decorator } from "@storybook/react";
import "../app/globals.css";

const withTheme: Decorator = (Story, context) => {
  const theme = context.globals.theme ?? "light";
  return (
    <div
      className={theme}
      style={{ minHeight: "100vh", background: "var(--color-bg)", color: "var(--color-text-primary)" }}
    >
      <Story />
    </div>
  );
};

const preview: Preview = {
  globalTypes: {
    theme: {
      description: "Color theme",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: [
          { value: "light", icon: "sun", title: "Light" },
          { value: "dark", icon: "moon", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: "light",
  },
  decorators: [withTheme],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;

