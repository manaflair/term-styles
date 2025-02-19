import {colorNames}                                                         from './data/colorNames.compiled.json';
import {Target, getColorResetSequence, getColorSequence, resolveColorToRgb} from './tools/getColor';

export {ansiPattern} from './tools/ansiPattern';

export const feature = {
  enableMouseTracking: {in: `\x1b[?1000h`, out: `\x1b[?1000l`},
  enableMouseHoldTracking: {in: `\x1b[?1002h`, out: `\x1b[?1002l`},
  enableMouseMoveTracking: {in: `\x1b[?1003h`, out: `\x1b[?1003l`},
  enableExtendedCoordinates: {in: `\x1b[?1006h`, out: `\x1b[?1006l`},
};

export const request = {
  screenBackgroundColor: `\x1b]11;?\x07`,
};

export const screen = {
  reset: `\x1bc\x1b[?1000l\x1b[?25h`,
  clear: `\x1b[H\x1b[J`,
  clearBelow: `\x1b[J`,

  alternateScreen: {in: `\x1b[?1049h`, out: `\x1b[?1049l`},
  noWrap: {in: `\x1b[?7l`, out: `\x1b[?7h`},
};

function moveTo(target: {x: number, y: number}): string;
function moveTo(target: {col: number, row: number}): string;
function moveTo({x, y, col = x, row = y}: {x?: number, y?: number, col?: number, row?: number}) {
  return `\x1b[${row! + 1};${col! + 1}H`;
}

function moveBy(target: {x: number, y: number}): string;
function moveBy(target: {col: number, row: number}): string;
function moveBy({x, y, col = x, row = y}: {x?: number, y?: number, col?: number, row?: number}) {
  return `${cursor.downBy(row)}${cursor.rightBy(col)}`;
}

export const cursor = {
  normal: `\x1b[34h\x1b[?25h`,
  hidden: `\x1b[?25l`,
  enhanced: `\x1b[34l`,

  upBy: (n = 1): string => n === 0 ? `` : n < 0 ? cursor.downBy(-n) : `\x1b[${n}A`,
  downBy: (n = 1): string => n === 0 ? `` : n < 0 ? cursor.upBy(-n) : `\x1b[${n}B`,
  leftBy: (n = 1): string => n === 0 ? `` : n < 0 ? cursor.rightBy(-n) : `\x1b[${n}D`,
  rightBy: (n = 1): string => n === 0 ? `` : n < 0 ? cursor.leftBy(-n) : `\x1b[${n}C`,

  moveTo,
  moveBy,

  request: `\x1b[6n`,
};

export type ColorName = keyof typeof colorNames;

const colorFront = (id: ColorName | string) => getColorSequence(id, Target.Foreground);
colorFront.out = getColorResetSequence(Target.Foreground);

const colorBack = (id: ColorName | string) => getColorSequence(id, Target.Background);
colorBack.out = getColorResetSequence(Target.Background);

const colorScreen = (id: ColorName | string) => {
  const rgb = resolveColorToRgb(id);
  return `\x1b]11;rgb:${rgb.R.toString(16)}/${rgb.G.toString(16)}/${rgb.B.toString(16)}\x07`;
};
colorBack.out = `\x1b]111\x07`;

for (const color of Object.keys(colorNames)) {
  (colorFront as any)[color] = colorFront(color);
  (colorBack as any)[color] = colorBack(color);
  (colorScreen as any)[color] = colorScreen(color);
}

export const style = {
  clear: `\x1b[m\x0f`,

  emboldened: {in: `\x1b[1m`, out: `\x1b[22m`},
  fainted: {in: `\x1b[2m`, out: `\x1b[22m`},
  italicized: {in: `\x1b[3m`, out: `\x1b[23m`},
  underlined: {in: `\x1b[4m`, out: `\x1b[24m`},
  inversed: {in: `\x1b[7m`, out: `\x1b[27m`},
  hidden: {in: `\x1b[8m`, out: `\x1b[28m`},
  strikethrough: {in: `\x1b[9m`, out: `\x1b[29m`},

  color: {
    front: colorFront as (typeof colorFront) & {
      [key in ColorName]: string;
    },
    back: colorBack as (typeof colorBack) & {
      [key in ColorName]: string;
    },
    screen: colorScreen as (typeof colorScreen) & {
      [key in ColorName]: string;
    },
  },
};
