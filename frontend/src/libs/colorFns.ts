import Color from "color";

export const brighten = (color: string, amount: number) =>
  Color(color).mix(Color("white"), amount).string();

export const darken = (color: string, amount: number) =>
  Color(color).mix(Color("black"), amount).string();

export const mixBlackWhite = (color: string, black: number, white: number, alpha = 1) => {
  return Color(color)
    .mix(Color("black"), black)
    .mix(Color("white"), white)
    .alpha(alpha)
    .string();
}

export const opacity = (color: string, amount: number) =>
  Color(color).alpha(amount).string();

export const flattenColor = (baseColorString: string, backgroundColorString: string) => {
  const baseColor = Color(baseColorString);
  const backgroundColor = Color(backgroundColorString);
  const alpha = baseColor.alpha();
  return baseColor.alpha(0).mix(backgroundColor, 1 - alpha).string();
};
