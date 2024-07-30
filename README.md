# VitePress Scalar
[![GitHub Sponsors](https://img.shields.io/badge/GitHub%20Sponsors-support%20me-EA4AAA?style=flat-square)](https://github.com/sponsors/cyyynthia)
[![License](https://img.shields.io/github/license/cyyynthia/vite-plugin-magical-svg.svg?style=flat-square)](https://github.com/cyyynthia/vite-plugin-magical-svg/blob/mistress/LICENSE)

A [VitePress](https://vitepress.dev/) addon to integrate [Scalar](https://github.com/scalar/scalar) OpenAPI references.
Seamlessly integrates with the default theme[^vp-theme], including if you customized it[^vp-theme-customization].

[^vp-theme]: VitePress Scalar has been only tested with the default VitePress theme. It shouldn't have any issues
working with a completely custom theme, but at this time it is untested and probably broken.

[^vp-theme-customization]: While changes to colors will work out of the box, more advanced changes may require some
tweaks to be applied to Scalar-related styles. Due to the crude implementation at this time, certain theme changes may
not work at this time but may gain better support later (e.g. sidebar).

> [!CAUTION]
> At this time, this addon is **HIGHLY experimental**. It currently is merely a proof of concept, and while it
> works(ish) for the most part, using it in production at this time is not advisable. There are many areas that
> have not been tested, and/or are good enough for a PoC but will need complete refactors to be production grade.
>
> Breaking changes *can* and **will** happen.

## Areas of improvement
As this project is at this stage mostly a proof of concept, there are many things that are unhandled, poorly handled,
or temporary.

Here is a non-exhaustive list of the things that would absolutely need to get handled before being anywhere near
production readiness:

- [ ] **Markdown handling**. Currently, the whole OpenAPI spec fetching, parsing and rendering is handled by Scalar at
  runtime. It's fine for a PoC, but is terrible for production. Not only does this mean the runtime will make calls to
  fetch the spec, parse it on the viewer's computer, but it also uses a completely different Markdown parsing pipeline
  than the one used to parse documents, which is really not ideal.
  - The OpenAPI spec should be processed at build-time, the same way Markdown documents are. Remark should be patched
    out to use VitePress's Markdown rendering logic, which would improve the integration with VitePress's theme, and
    run the configured Markdown plugins on the OpenAPI docs.
  - There is a valid argument that can be made, that doing it this way allows the docs to automagically update without
    having to re-build and deploy the VitePress app. Even if support for runtime rendering is preserved, it should
    just build VitePress's Markdown rendering logic in the final app to keep it consistent.
- [ ] **Sidebar**. The current implementation just heavily changes Scalar's theme to make its sidebar look like
  VitePress's, but that's not ideal. It'd be nice to ditch Scalar's sidebar and use the one from VitePress directly to
  improve compatibility with user styles & reduce code size.
- [ ] **Scalar search**. The search component from Scalar has been stripped out; the goal is to merge it with
  VitePress's own search system but this has not been done at this time - so there is no way to search through the
  docs for now.
- [ ] **Builtin Scalar client**. It seems to be working, but is completely untested and seems to have issues with how
  things are linked, causing problems while navigating the client.
- [ ] **Local OpenAPI files**. Or even the whole way OpenAPI reference pages are declared. Right now, using a Markdown
  file was the easiest way to get something up and running, as VitePress's internals are really not expecting a lot of
  extensibility in this area. It is not impossible, however, to have a custom plugin to handle this in a much more
  advanced manner - including with support for local files.
- [ ] **Internationalized OpenAPI files**. For projects having their documentation available in multiple languages, it
  may be interesting to explore the possibilities regarding i18n. Or consider that the existing implementation is 
  sufficient - either way, there should be a guide for this.
- [ ] **Accessibility review**. Accessibility has not been checked at all for now, but I am pretty sure there are at
  least a few places where contrast is insufficient. Scalar was designed with an almost pitch-black background whereas
  VitePress has a brighter dark theme.

All of these will most likely require heavy changes to the way things are implemented here. This is especially true
for how Scalar is consumed; right now the ApiReference component is used to do everything; this will need to change.
