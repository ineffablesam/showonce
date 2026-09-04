import { continueRender, delayRender, staticFile } from 'remotion'

/**
 * Manual FontFace loading instead of `@remotion/fonts`'s `loadFont()` —
 * that package's own internal `delayRender()` was timing out under
 * back-to-back renders. This version calls `continueRender()` no matter
 * what (even on a failed/slow font fetch) so a font hiccup can never
 * hang or crash a render — worst case it falls back to the system font
 * for that run.
 */
export const SF_PRO_DISPLAY = 'SF Pro Display'

const WEIGHTS: Array<[string, string]> = [
  ['400', 'SFProDisplay-Regular.woff2'],
  ['500', 'SFProDisplay-Medium.woff2'],
  ['600', 'SFProDisplay-Semibold.woff2'],
  ['700', 'SFProDisplay-Bold.woff2'],
  ['800', 'SFProDisplay-Heavy.woff2'],
]

WEIGHTS.forEach(([weight, file]) => {
  const handle = delayRender(`Loading ${file}`, { timeoutInMilliseconds: 15000 })
  const font = new FontFace(
    SF_PRO_DISPLAY,
    `url('${staticFile(`fonts/${file}`)}') format('woff2')`,
    { weight },
  )
  font
    .load()
    .then((loaded) => {
      document.fonts.add(loaded)
      continueRender(handle)
    })
    .catch((error) => {
      console.warn(`[fonts] Failed to load ${file}, continuing anyway`, error)
      continueRender(handle)
    })
})
