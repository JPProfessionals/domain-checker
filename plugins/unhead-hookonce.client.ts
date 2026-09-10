/**
 * @nuxt/ui@4.9 colors plugin calls injectHead().hooks.hookOnce('dom:rendered', …)
 * on SPA boots. Unhead v3 (Nuxt 4.5+) uses HookableCore without hookOnce.
 * Polyfill before UI runs so /de (and any non-SSR entry) does not 500.
 */
export default defineNuxtPlugin({
  enforce: 'pre',
  setup() {
    const head = injectHead()
    const hooks = head?.hooks as
      | {
          hook?: (name: string, fn: (...args: unknown[]) => unknown) => () => void
          hookOnce?: (name: string, fn: (...args: unknown[]) => unknown) => () => void
        }
      | undefined

    if (!hooks?.hook || typeof hooks.hookOnce === 'function') {
      return
    }

    hooks.hookOnce = (name, fn) => {
      const unhook = hooks.hook!(name, (...args: unknown[]) => {
        unhook()
        return fn(...args)
      })
      return unhook
    }
  },
})
