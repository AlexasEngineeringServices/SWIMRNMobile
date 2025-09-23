/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from "react-native";

export const Colors = {
  paleCyan: "#E0F7FA",
  deepSkyBlue: "#00BFFF",
  azureBlue: "#007FFF",
  charcoal: "#263238",
  slateGray: "#607D8B",
  vividGreen: "#00C853",
  coralRed: "#FF5252",
  mistGray: "#CFD8DC",
  offWhite: "#FFFFFC",
  transparent: "transparent",
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const FONT_SIZES = {
  xxl: 32,
  xl: 28,
  lg: 24,
  md: 20,
  base: 16,
  sm: 14,
  xs: 12,
};

export const LINE_HEIGHTS = {
  xxl: 40,
  xl: 36,
  lg: 32,
  md: 28,
  base: 24,
  sm: 20,
  xs: 16,
};

export const FONT_WEIGHTS = {
  light: "300",
  regular: "400",
  medium: "500",
  semiBold: "600",
  bold: "700",
};

export default {
  FONT_SIZES,
  LINE_HEIGHTS,
  FONT_WEIGHTS,
};
