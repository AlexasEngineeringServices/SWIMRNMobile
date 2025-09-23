import type { Theme } from "@react-navigation/native";
import { Colors, Fonts } from "../constants/theme";
export const swimTheme: Theme = {
  dark: false,
  colors: {
    primary: Colors.deepSkyBlue,
    background: Colors.paleCyan,
    card: Colors.offWhite,
    text: Colors.charcoal,
    border: Colors.slateGray,
    notification: Colors.coralRed,
  },
  fonts: {
    regular: {
      fontFamily: Fonts.sans,
      fontWeight: "400",
    },
    medium: {
      fontFamily: Fonts.sans,
      fontWeight: "500",
    },
    bold: {
      fontFamily: Fonts.sans,
      fontWeight: "700",
    },
    heavy: {
      fontFamily: Fonts.sans,
      fontWeight: "800",
    },
  },
};
