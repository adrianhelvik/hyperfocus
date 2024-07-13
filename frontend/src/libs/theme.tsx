import Color from "color";

export const ui1 = `rgb(114, 32, 222)`;
export const ui2 = `rgb(150, 84, 236)`;
export const ui3 = `rgb(241, 216, 44)`;

export const darkPurple = `rgb(69, 35, 114)`;

export const secondary1 = `rgb(252, 227, 65)`;

export const tertiary1 = "rgb(188, 66, 244)";

export const gray1 = `#7a7a7a`;
export const gray2 = `#dbdbdb`;

export const placeholderGray = "#ababab";

export const shadows = [
  `0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)`,
  `0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)`,
  `0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)`,
  `0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)`,
  `0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22)`,
  `0 1px 4px 1px rgba(0, 0, 0, 0.25)`,
];

export const brightBlue = `rgb(198, 249, 255)`;
export const useWhiteInstead = `rgb(255, 255, 255)`;

export const logo1Dark = `rgb(90, 90, 90)`;
export const logo2Dark = `rgb(0, 0, 0)`;

export const red = `rgb(255, 0, 0)`;

export const defaultDeckColor = "rgb(200, 200, 200)";

export const bg1 = `rgb(26, 20, 33)`;
export const bg2 = `rgb(227, 226, 229)`;

let stars: string[] = [];

const opacityDeterminant = 18;
const radiusIncrease = 3.7;
const baseShineHeight = 0;
const shineHeightRand = 6;
const max = 50;
const i0 = 15;

let radius = 15;
for (let i = i0; i < max; i++) {
  const rand1 = (i % 17) / 17;
  // const rand2 = (i % 17) / 17;

  const width = 5;
  const height = 5;
  const shineHeight = baseShineHeight + (shineHeightRand * rand1);
  radius += radiusIncrease;
  let opacity = (i % opacityDeterminant) / opacityDeterminant -(radius / 100);
  const x = radius * Math.cos(i) + 50;
  const y = radius * Math.sin(i) + 50;
  opacity = (max - radius) / max
  stars.push(`radial-gradient(${width}px ${height}px at ${x}% ${y}%, rgba(255, 255, 255, ${opacity}), rgba(255, 255, 255, 0))`);
  stars.push(`radial-gradient(${width * 0.5}px ${height * shineHeight}px at ${x}% ${y}%, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0))`);
  stars.push(`radial-gradient(${width * shineHeight}px ${height * 0.5}px at ${x}% ${y}%, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0))`);
}

export const smoothGradient = [
  ...stars,
  `linear-gradient(90deg, rgba(0,0,0,0), ${Color(brightBlue).alpha(0.1).string()})`,
  `linear-gradient(black, ${Color(brightBlue).darken(0.9).hex()})`,
].join(", ");
