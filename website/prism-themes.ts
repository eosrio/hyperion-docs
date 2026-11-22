import type {PrismTheme} from 'prism-react-renderer';

// Colors are qualified against the actual code panel in custom.css, without
// token opacity. Keep comments and less common tokens as readable as the code.
const tokenTypes = [
  ['comment', 'prolog', 'doctype', 'cdata'],
  ['keyword', 'atrule', 'builtin', 'tag', 'selector', 'changed'],
  ['string', 'attr-value', 'char', 'template-punctuation'],
  ['number', 'boolean', 'constant', 'symbol', 'regex', 'inserted'],
  ['property', 'attr-name', 'variable', 'entity', 'url'],
  ['function', 'function-variable', 'class-name'],
  ['deleted', 'important'],
];

function theme(color: string, backgroundColor: string, colors: string[]): PrismTheme {
  return {
    plain: {color, backgroundColor},
    styles: tokenTypes.map((types, index) => ({types, style: {color: colors[index]}})),
  };
}

export const lightCodeTheme = theme('#24292f', '#ffffff', [
  '#62625b', '#005a89', '#a71d4f', '#6542a6', '#066e69', '#6542a6', '#9c2a35',
]);

export const darkCodeTheme = theme('#dedede', '#0c0c0c', [
  '#9fa99a', '#7bcff4', '#dfaa92', '#c4b7e5', '#8bcacc', '#d8ce9c', '#ee9999',
]);
