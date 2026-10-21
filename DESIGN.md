---
name: Hyperion documentation
description: The implemented Hyperion documentation visual system on Rio Blocks dark and light foundations.
colors:
  primary: "#0094d2"
  light-link: "#00699a"
  light-link-dark: "#005b86"
  light-link-darker: "#00537a"
  light-link-darkest: "#004363"
  light-link-light: "#0077b0"
  light-link-lighter: "#007fbc"
  dark-link: "#5cc3f0"
  dark-link-dark: "#39b6eb"
  dark-link-darker: "#20ade8"
  dark-link-light: "#7bcff4"
  dark-link-lighter: "#9bdbf7"
  dark-link-lightest: "#c0eafa"
  light-ground: "#f6f6f3"
  light-panel: "#fff"
  light-inset: "#f0f0eb"
  light-text: "#141414"
  light-heading: "#101010"
  light-secondary: "#464646"
  light-muted: "#50504b"
  light-rule: "#dcdcd6"
  light-emphasis-300: "#c7c7bf"
  light-emphasis-600: "#5c5c5c"
  light-inline-code: "#e9e9e3"
  light-menu-active: "#0094d212"
  light-menu-hover: "#00000006"
  light-scroll-track: "#eeeee9"
  light-scroll-thumb: "#b4b4ac"
  dark-ground: "#050505"
  dark-panel: "#0c0c0c"
  dark-inset: "#111"
  dark-text: "#f0f0f0"
  dark-secondary: "#b8b8b8"
  dark-muted: "#aaa"
  dark-rule: "#272727"
  dark-emphasis-300: "#373737"
  dark-inline-code: "#151515"
  dark-menu-active: "#0094d219"
  dark-menu-hover: "#ffffff06"
  dark-scroll-thumb: "#454545"
  light-status: "#0f766e"
  dark-status: "#14b8a6"
  masthead-amber: "#f59e0b"
  search-backdrop: "#0009"
  light-code-plain: "#24292f"
  light-code-comment: "#62625b"
  light-code-keyword: "#005a89"
  light-code-string: "#a71d4f"
  light-code-number-function: "#6542a6"
  light-code-property: "#066e69"
  light-code-deleted: "#9c2a35"
  dark-code-plain: "#dedede"
  dark-code-comment: "#9fa99a"
  dark-code-keyword: "#7bcff4"
  dark-code-string: "#dfaa92"
  dark-code-number: "#c4b7e5"
  dark-code-property: "#8bcacc"
  dark-code-function: "#d8ce9c"
  dark-code-deleted: "#ee9999"
  copy-success: "#00d600"
typography:
  display:
    fontFamily: "'Inter Variable', Inter, system-ui, sans-serif"
    fontSize: "clamp(36px, 4vw, 52px)"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-.035em"
  headline:
    fontFamily: "'Inter Variable', Inter, system-ui, sans-serif"
    fontSize: "clamp(32px, 3vw, 43px)"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-.025em"
  title:
    fontFamily: "'Inter Variable', Inter, system-ui, sans-serif"
    fontSize: "25px"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-.025em"
  task-title:
    fontFamily: "'Inter Variable', Inter, system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "-.025em"
  body:
    fontFamily: "'Inter Variable', Inter, system-ui, sans-serif"
    fontSize: "16px"
    lineHeight: 1.8
    fontFeature: "'cv11', 'ss01'"
  reading:
    fontFamily: "'Inter Variable', Inter, system-ui, sans-serif"
    fontSize: "16px"
    lineHeight: 1.85
    fontFeature: "'cv11', 'ss01'"
  label:
    fontFamily: "'Inter Variable', Inter, system-ui, sans-serif"
    fontSize: "12px"
  navigation:
    fontFamily: "'Inter Variable', Inter, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 500
  brand:
    fontFamily: "'Inter Variable', Inter, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 800
    letterSpacing: ".11em"
  mono:
    fontFamily: "'JetBrains Mono Variable', 'JetBrains Mono', monospace"
    fontSize: "12px"
    lineHeight: 1.9
  release-label:
    fontFamily: "'JetBrains Mono Variable', 'JetBrains Mono', monospace"
    fontSize: "11px"
  search-input:
    fontFamily: "'Inter Variable', Inter, system-ui, sans-serif"
    fontSize: "15px"
rounded:
  square: "0"
  breadcrumb: "3px"
  surface: "4px"
spacing:
  detail: "4px"
  compact: "8px"
  control: "12px"
  regular: "16px"
  roomy: "20px"
  gutter: "24px"
  section: "28px"
  wide: "32px"
components:
  search-trigger-light:
    backgroundColor: "{colors.light-panel}"
    textColor: "{colors.light-muted}"
    typography: "{typography.label}"
    rounded: "{rounded.surface}"
    padding: "8px 10px"
  search-trigger-dark:
    backgroundColor: "{colors.dark-panel}"
    textColor: "{colors.dark-muted}"
    typography: "{typography.label}"
    rounded: "{rounded.surface}"
    padding: "8px 10px"
  search-close-light:
    backgroundColor: "{colors.light-inset}"
    textColor: "{colors.light-muted}"
    typography: "{typography.label}"
    rounded: "{rounded.surface}"
    padding: "7px 10px"
  search-close-dark:
    backgroundColor: "{colors.dark-inset}"
    textColor: "{colors.dark-muted}"
    typography: "{typography.label}"
    rounded: "{rounded.surface}"
    padding: "7px 10px"
  search-input-light:
    backgroundColor: "{colors.light-ground}"
    textColor: "{colors.light-text}"
    typography: "{typography.search-input}"
    rounded: "{rounded.surface}"
    padding: "12px 14px"
    width: "100%"
  search-input-dark:
    backgroundColor: "{colors.dark-ground}"
    textColor: "{colors.dark-text}"
    typography: "{typography.search-input}"
    rounded: "{rounded.surface}"
    padding: "12px 14px"
    width: "100%"
  navbar-light:
    backgroundColor: "{colors.light-ground}"
    textColor: "{colors.light-text}"
    typography: "{typography.navigation}"
    padding: "0 30px"
    height: "76px"
  navbar-dark:
    backgroundColor: "{colors.dark-ground}"
    textColor: "{colors.dark-text}"
    typography: "{typography.navigation}"
    padding: "0 30px"
    height: "76px"
  sidebar-link:
    rounded: "{rounded.surface}"
    padding: "8px 12px"
  sidebar-active-light:
    backgroundColor: "{colors.light-menu-active}"
    textColor: "{colors.light-link}"
    typography: "{typography.navigation}"
    rounded: "{rounded.surface}"
    padding: "8px 12px"
  sidebar-active-dark:
    backgroundColor: "{colors.dark-menu-active}"
    textColor: "{colors.dark-link}"
    typography: "{typography.navigation}"
    rounded: "{rounded.surface}"
    padding: "8px 12px"
  task-row:
    typography: "{typography.task-title}"
    padding: "21px 0"
  code-panel-light:
    backgroundColor: "{colors.light-panel}"
    textColor: "{colors.light-code-plain}"
    typography: "{typography.mono}"
    rounded: "{rounded.surface}"
  code-panel-dark:
    backgroundColor: "{colors.dark-panel}"
    textColor: "{colors.dark-code-plain}"
    typography: "{typography.mono}"
    rounded: "{rounded.surface}"
  version-notice-light:
    backgroundColor: "{colors.light-inset}"
    textColor: "{colors.light-muted}"
    typography: "{typography.label}"
    rounded: "{rounded.surface}"
    padding: "11px 15px"
  version-notice-dark:
    backgroundColor: "{colors.dark-inset}"
    textColor: "{colors.dark-muted}"
    typography: "{typography.label}"
    rounded: "{rounded.surface}"
    padding: "11px 15px"
  pagination:
    rounded: "{rounded.surface}"
    padding: "17px 20px"
  search-result:
    padding: "16px 0"
  example-tab:
    typography: "{typography.label}"
    rounded: "{rounded.square}"
    padding: "11px 17px"
---

# Design System: Hyperion documentation

## Overview

**Creative North Star: "Hyperion handbook"**

This is descriptive shorthand for the implemented documentation world: functional, restrained and readable. The Hyperion blue and flat gem with heartbeat H lead within Rio Blocks neutral dark and light fields. Inter carries the reading hierarchy; JetBrains Mono distinguishes code, paths and release context. Hairlines, small corners and tonal changes provide structure without promotional imagery.

The system supports API developers and node operators with equal care. It keeps procedures, examples, navigation and qualification notes legible. The selected task homepage and handbook composition belong to the [surface brief](.impeccable/surfaces/website-src-pages-index-tsx.md); their arrangement is not a required template for every future surface. The checked-in mark is a static vector, not a rotating solid. No raster product assets are used.

**Key Characteristics:**

- Neutral grounds with restrained, theme-specific blue links.
- Inter reading type paired with JetBrains Mono technical text.
- Hairline boundaries, tonal depth and four-pixel surface corners.
- Readable examples, visible keyboard focus and reachable search.
- Release context presented as quiet, explicit documentation.

This scan records `website/src/css/custom.css`, `website/prism-themes.ts`, the homepage and theme overrides, the checked-in SVG mark and the installed Docusaurus/Infima component styles. The frontmatter owns extracted primitives; `.impeccable/design.json` adds motion, depth, breakpoint metadata and representative HTML/CSS. Synthetic swatch ramps in that sidecar are labeled preview-only and are not implementation tokens. Final capture/review evidence is under `.impeccable/review/`; the recorded ship verdict covers the corrected syntax-contrast finding, not publication or complete migration acceptance.

## Colors

The palette places Hyperion blue against nearly black or warm off-white neutrals; supporting hues stay within the existing masthead detail and syntax highlighting.

### Primary

- **Hyperion blue** (`primary`): the fixed SVG stroke and global keyboard-focus outline. The light and dark link tokens adjust reading contrast while preserving this identity.
- **Light reading blue** (`light-link` and its extracted variants): links, active navigation and controls on the light ground. The lightest implemented primary shade is Hyperion blue.
- **Dark reading blue** (`dark-link` and its extracted variants): links, active navigation and controls on the dark ground. The darkest implemented primary shade is Hyperion blue.

**The Readable Blue Rule.** Use the current theme's reading-blue token for text links and active navigation; preserve Hyperion blue for the mark and focus outline.

### Neutral

- **Light ground / panel / inset**: the page and masthead use `light-ground`; code and search use `light-panel`; notices, table headings and the footer use `light-inset`.
- **Dark ground / panel / inset**: the page and masthead use `dark-ground`; code, search and the footer use `dark-panel`; notices and table headings use `dark-inset`.
- **Text / secondary / muted**: main prose and headings lead; supporting copy, metadata and navigation groups step down through the extracted theme roles. Muted text remains opaque rather than inheriting a blanket opacity.
- **Rules and emphasis**: `light-rule` / `dark-rule` divide navigation, tables and panels; emphasis variants support inherited Docusaurus controls. Active menu backgrounds retain their source alpha colors.
- **Inline code** uses its own light/dark inset token. Thin scrollbars use the extracted track and thumb colors. Text selection uses the light-blue variant with white text in both themes.

The masthead also has one existing hairline gradient from `masthead-amber` to `dark-status`, at opacity (.55). The status custom properties are recorded as source values; this scan does not assign them new status semantics or expand them into another accent system.

### Syntax palette

The custom Prism palette is independent of link and status colors. These are opaque text colors against the actual code panels, not tinted overlays.

| Token group | Light primitive | Dark primitive |
| --- | --- | --- |
| Plain / unmatched | `light-code-plain` | `dark-code-plain` |
| Comment, prolog, doctype, cdata | `light-code-comment` | `dark-code-comment` |
| Keyword, atrule, builtin, tag, selector, changed | `light-code-keyword` | `dark-code-keyword` |
| String, attr-value, char, template-punctuation | `light-code-string` | `dark-code-string` |
| Number, boolean, constant, symbol, regex, inserted | `light-code-number-function` | `dark-code-number` |
| Property, attr-name, variable, entity, url | `light-code-property` | `dark-code-property` |
| Function, function-variable, class-name | `light-code-number-function` | `dark-code-function` |
| Deleted, important | `light-code-deleted` | `dark-code-deleted` |

The stored syntax check reports a minimum contrast of (6.10:1) on the light panel and (8.03:1) on the dark panel, including fallback/plain text and comments. Its scope is these eight text groups per theme. See `.impeccable/review/syntax-contrast.json`; do not generalize it into a full-site accessibility certification.

## Typography

**Display and Body Font:** Inter Variable, Inter, system-ui, sans-serif. **Technical Font:** JetBrains Mono Variable, JetBrains Mono, monospace. Both variable fonts are imported from the installed Fontsource packages. The body enables (`cv11`, `ss01`).

The pairing gives prose a quiet, precise texture while making code and paths distinguishable. The source uses a contextual hierarchy rather than a uniform mathematical scale.

- **Display:** the homepage opening uses the `display` role, with a compact line height and slightly tighter tracking. It becomes (42px) at the medium navigation breakpoint and (36px) at the narrow breakpoint.
- **Headline:** article titles use `headline`, changing to (33px) on narrow screens. Headings balance wrapping. Secondary article headings use `title`; tertiary headings use (19px), both inheriting heading weight (600) and line height (1.25). Narrow secondary headings use (24px).
- **Task title:** useful links use `task-title`, changing to (20px) at the medium breakpoint. Their descriptions use (14px), line height (1.8), and a maximum width of (50ch); the intermediate breakpoint uses (13px).
- **Body / reading:** base text uses `body`; handbook prose uses the more open `reading` role. Direct article paragraphs stop at (72ch). Headings and paragraphs retain breathing room rather than increasing text density to fill a column.
- **Label / navigation:** labels, captions, local contents and metadata use (12px); desktop section links use `navigation`. The masthead brand uses `brand`, becoming (13px) on narrow screens. Release labels and search result paths use the mono family at (11px).
- **Code:** blocks use `mono`; the first-request block uses (11.5px). Inline code uses the inherited code-size ratio (85%) with padding (2px 5px); block code retains normal unbroken code wrapping and horizontal scrolling.

**The Technical Text Rule.** Keep executable examples and technical paths in the mono family; keep prose and navigational task labels in Inter.

## Layout

The implementation uses a compact masthead and bounded content, with margins, hairlines and reading width doing most of the organizing. The handbook has a contextual sidebar (258px), reading area and local contents; local contents include heading levels two and three. The sidebar is hideable and does not automatically collapse categories. Article containers start with padding (26px) and end with (48px); the top padding becomes (14px) on narrow screens. The viewport scroll offset is (100px).

The reusable spacing entries in frontmatter are observed values, not a claim that every measurement follows a single spacing scale. Actual controls use paired padding specific to their purpose. Content gutters and navigation density change at the source breakpoints:

| Boundary | Implemented behavior |
| --- | --- |
| Minimum (1441px) | General content container caps at (1440px). |
| Maximum (1200px) | Masthead padding becomes (0 20px), links become (12px), and the search shortcut hint hides. Homepage side padding becomes (38px). |
| Maximum (996px) | Masthead height becomes (70px). The Docusaurus mobile navigation replaces desktop links; search becomes an icon-only (38px) square while retaining its accessible label. |
| Maximum (700px) | Masthead side padding becomes (16px), mark height (35px), and homepage padding (32px 24px). The chosen homepage columns stack; article title sizes and dialog spacing reduce. |

For the chosen homepage only, the outer width caps at (1420px), desktop padding is (58px 60px 40px), and the main two-column gap is (70px), then (38px), then (32px), then a stacked (28px). These describe that surface's current composition; they are not global layout obligations.

The search dialog is bounded to `min(680px, calc(100% - 32px))`, with maximum height `min(75vh, 760px)`, top margin (12vh) and internal padding (25px). On narrow screens it uses top margin (8vh), padding (20px) and maximum height (82vh). Long tables and code remain horizontally scrollable within the reading area.

## Elevation & Depth

Ordinary content is flat: masthead, sidebar brand, code panels, admonitions and version notices explicitly remove shadows. Background tone and a single-pixel rule separate adjacent surfaces. Overlaid menus and the search dialog are the two implemented shadow exceptions; the search backdrop dims the document behind it.

### Shadow Vocabulary

- **Dropdown:** `0 10px 30px #0002`, used by the masthead menu.
- **Search dialog:** `0 25px 80px #0005`, paired with the `search-backdrop` token.

**The Quiet Surface Rule.** Use tonal separation and hairlines for ordinary reading surfaces; retain the existing shadows for overlaid menus and search.

## Shapes

Surface corners use `rounded.surface`: lightly squared, with a border (1px). Breadcrumbs use the smaller breadcrumb radius. Example tabs remain square and signal selection with a bottom border (2px), rather than a rounded filled pill. Task links are open rows divided by top rules; pagination links and explanatory panels are bounded rectangles.

The existing identity is a flat outlined gem with a heartbeat H, rendered from `website/static/img/hyperion-mark.svg`. Its outer stroke is (2.6), heartbeat stroke (3), and inner outline opacity (.42) in the SVG coordinate system. The mark has no animation in this implementation. Keep its proportions and source paths; do not replace it with a rotating EOS-like solid.

## Components

### Buttons

Search uses a restrained outlined trigger with theme panel background, muted text, label typography, a search icon (15px), gap (9px), and minimum height (38px). Its border becomes the theme reading blue on hover. The shortcut hint is mono (11px), visually unboxed. The close control uses the inset background and (7px 10px) padding; it has no custom hover treatment beyond its existing resting style and global keyboard focus. No filled promotional primary-button component is established by this foundation.

Copy buttons come from Docusaurus. They use the code foreground/background, emphasis border, surface radius and padding (.4rem). They are hidden at rest, become partly visible on code-block hover, and become fully visible on button hover or keyboard focus. The inherited copy glyph changes to a success glyph for (1000ms) after copying. Its inherited success color is recorded as `copy-success`; this is not a new product-wide success palette.

### Inputs / Fields

The search field uses the current page ground, main text, muted placeholder, theme-blue caret, a hairline border, surface radius and (12px 14px) padding. Its visible label describes the searchable content. The source does not define custom invalid or disabled field states.

All keyboard-focusable elements receive the global outline (2px) with offset (4px), in Hyperion blue. Preserve semantic buttons, links, labels and their accessible names when reusing these patterns.

### Navigation

The masthead uses the page ground and a bottom rule, with the existing gradient hairline immediately below. At desktop its height is (76px), mark height (42px), brand gap (9px), and section-link padding (12px 11px). Active and hovered links use the current primary color. The release dropdown is mono and remains visually distinct from section names. The theme toggle switches between dark and light; dark is the configured default and automatic system preference is disabled. Docusaurus persists the user's theme choice.

The handbook sidebar uses (13px) text, line height (1.6), and rounded links with (8px 12px) padding. Category labels are (12px), weight (600), and muted. Active leaf links use the theme's blue tint and weight (500); hover uses the extracted faint neutral overlay. The local contents use muted (12px) links, becoming reading blue for the active heading. Mobile sidebar links retain a minimum height (42px).

### Cards / Containers

Pagination is the canonical small linked container: one-pixel theme rule, surface radius and (17px 20px) padding. Its label is (14px), weight (500); the (12px) directional sublabel is muted. The border changes to the current primary color on hover. There is no hover lift or card shadow.

Admonitions use the theme panel, full text color, (14px) body, surface radius, a complete hairline border and margin (28px 0). Their headings are (12px), without added tracking or text transform. Reference tables use rules and inset headers; alternating rows remain transparent.

### Task links

The signature task link is a full clickable row with a top rule, text and an inline arrow. Its grid uses `1fr 26px`, gap (26px), and padding (21px 0); narrow rows use padding and gap (17px). Hover changes the title to reading blue and moves the arrow right (3px) over (.18s ease). The arrow is a stroked SVG (23px), not an image asset. Keyboard focus uses the global outline.

### Tabbed examples

Language choices use accessible Docusaurus tabs with shared language-group selection. Tabs use label typography, weight (500), square corners and (11px 17px) padding. The selected language uses the current primary color and an underline (2px). Code sits directly below without an extra tab-panel gap. The homepage wraps tabs and code in one rounded border; ordinary code blocks have their own border. Preserve copy controls and the corrected Prism palette when reusing this pattern.

### Search dialog

The custom search uses a native modal dialog with an accessible title, a labeled input, close button and polite status region. The trigger and Ctrl/Cmd+K open it and focus the input; Escape, the close button and clicking the dialog's background close it. Explicit close returns focus to the trigger. Results show a blue title, muted excerpt and mono path, separated by rules. Loading, empty and unavailable states are text, not decorative placeholders. The implementation waits (160ms) before each query and shows up to eight results; the preview content is release-scoped.

### Release notice

Release context is a quiet note with inset background, muted label text, surface radius and (11px 15px) padding. Its label is emphasized and its published-documentation link uses reading blue. It is a note, not a chip or urgency badge; preserve the actual release wording when using it in documentation.

### Motion and accessibility

Motion serves state changes: the task arrow translates, inherited controls transition over (200ms), and copy feedback swaps icons. Reduced-motion preference disables animations and transitions throughout and forces automatic scrolling. The mark remains static. Search's keyboard behavior, focus outline, live status and labeled icon trigger are part of the implemented pattern; HTML/CSS previews in the sidecar illustrate appearance and do not replace the framework behavior.

## Do's and Don'ts

### Do:

- **Do** retain the existing Hyperion SVG mark, Hyperion blue and Rio Blocks neutral dark/light fields.
- **Do** use the theme's reading blue, rule, panel, muted text and inset variables so both themes remain coherent.
- **Do** keep Inter for reading and navigation, and JetBrains Mono for code, paths and release labels.
- **Do** preserve visible keyboard focus, semantic labels, copy feedback and the reduced-motion override.
- **Do** keep code syntax opaque and verify it against the actual light and dark panels when changing the palette.
- **Do** keep page-specific composition in its surface brief and document new reusable patterns only after implementation.

### Don't:

- **Don't** replace the flat gem and heartbeat H with a rotating EOS-like solid.
- **Don't** treat the old blue/orange Material theme as the current brand authority.
- **Don't** introduce promotional imagery in place of useful documentation content.
- **Don't** add card lift, broad shadows or large pill corners to ordinary reading surfaces.
- **Don't** treat synthesized preview ramps as implemented theme tokens.
- **Don't** present the syntax-contrast review or local design foundation as complete migration, release or deployment acceptance.
