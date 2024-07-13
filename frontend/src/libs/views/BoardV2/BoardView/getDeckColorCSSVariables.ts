import Color from "color";
import { Deck, Portal } from "src/libs/types";

export function getDeckColorCSSVariables(child: Deck | Portal) {
  const deck = child.type === "portal" ? child.target : child;

  // TODO: Allow different colors for portals
  const deckColor = deck.color || "#757575";

  const isDark = Color(deckColor).darken(0.2).isDark();
  const isVeryDark = Color(deckColor).lighten(0.2).isDark();

  const colors: Record<string, string> = {};

  colors["--deck-color"] = deckColor;

  if (deck.color) {
    colors["--deck-color-or-unset"] = deckColor;
  }

  colors["--deck-text-color"] = isDark ? "white" : "black";
  colors["--deck-text-color"] = isDark ? "white" : "black";
  colors["--deck-black-or-white-contrast"] = isVeryDark ? "white" : "black";

  return colors;
}
