# Third-Party Notices

This project includes or repackages assets derived from eXeLearning in order to interoperate with `.elpx` projects, preserve compatible previews, and support in-browser conversion from legacy `.elp` projects to `.elpx`.

## Reused assets from eXeLearning

- Source project: https://github.com/exelearning/exelearning
- Project license: AGPL-3.0-or-later

Included resources in this repository:

- `app/public/base.elpx`
  - Base template package used to generate compatible `.elpx` files.
- `app/public/idevices/text/text.js`
- `app/public/idevices/text/text.css`
- `app/public/idevices/text/text.html`
  - Text iDevice assets reused for preview and packaging compatibility.
- `app/public/exe_math_assets.zip`
  - Packaged `exe_math` runtime copied from the local eXeLearning source tree for MathJax-compatible formula rendering in generated previews.
- `app/public/exelearning/importers.bundle.js`
- `app/public/exelearning/exporters.bundle.js`
  - Browser bundles reused from eXeLearning to run the real import/export pipeline for legacy `.elp` to `.elpx` conversion.
- `app/public/exelearning/bundles/common.zip`
- `app/public/exelearning/bundles/libs.zip`
- `app/public/exelearning/bundles/idevices.zip`
- `app/public/exelearning/bundles/content-css.zip`
- `app/public/exelearning/bundles/manifest.json`
  - Supporting resource bundles required by the reused eXeLearning browser import/export runtime.

## Vendored copy of omml2mathml

- Source project: https://github.com/scienceai/omml2mathml
- Project license: Apache-2.0 (see `src/vendor/omml2mathml/LICENSE`)

Included in this repository:

- `src/vendor/omml2mathml/index.js`
- `src/vendor/omml2mathml/operators.js`
  - Copied verbatim from omml2mathml 1.3.0, converted from CommonJS to ES
    modules, and with the `get-dom` import replaced by `./dom.js`.
- `src/vendor/omml2mathml/dom.js`
  - Written for this project. It supplies the empty document the converter
    builds the MathML tree on, using `@xmldom/xmldom` instead of `get-dom`,
    which pulled in jsdom 9 and its unmaintained dependency chain.

The library has been unmaintained since 2017, so there is no upstream release
to update to; the copy is kept here to convert OMML formulas from `.docx`.

## jSquash image codecs

- Source project: https://github.com/jamsinclair/jSquash
- Packages: `@jsquash/jpeg` 1.6.0, `@jsquash/png` 3.1.1, `@jsquash/webp` 1.5.0,
  `@jsquash/oxipng` 2.3.0 and `@jsquash/resize` 2.1.1, Apache-2.0.

They are installed as dependencies, and the web build in `docs/assets/`
redistributes their WebAssembly codecs. Each codec keeps the license of its
upstream project, shipped next to it as `LICENSE.codec.md` in the package:

- MozJPEG / libjpeg-turbo (JPEG): BSD-style licenses (IJG, Modified BSD, zlib).
- libwebp (WebP): BSD-3-Clause, Copyright (c) 2010, Google Inc.
- PNG decoder: BSD-3-Clause as stated in `@jsquash/png/codec/LICENSE.codec.md`.
- OxiPNG (PNG encoding): MIT, Copyright (c) 2016 Joshua Holmer.
- resize (Lanczos resampling): MIT, Copyright (c) 2015 PistonDevelopers; the
  package also bundles hqx (Apache-2.0) and magic-kernel (MIT, Copyright (c)
  2024 Serhii Tatarintsev), which eXeConvert does not call.

They reduce the images of imported documents that are larger than
eXeLearning shows them, with the limit and quality of the default preset of
[elpx-optimizer](https://github.com/ateeducacion/elpx-optimizer), which uses
the same codecs.

## Inno Setup translations for the Windows installer

- Source: https://github.com/jrsoftware/issrc (`Files/Languages/Unofficial/`),
  under the Inno Setup license (https://jrsoftware.org/files/is/license.txt).
- `scripts/package-cli/inno-languages/Galician.isl`: Galician messages for Inno
  Setup 6.5.0+, translated by MdL.
- `scripts/package-cli/inno-languages/Basque.isl`: Basque messages for Inno
  Setup 6.5.0+, translated by Xabier Aramendi and Marimar.

Both are user-contributed translations, copied as published with a UTF-8 byte
order mark added so that Inno Setup reads their accents correctly. The
English, Spanish and Catalan messages are the ones shipped with Inno Setup.

## Lucide icons

- Source: https://lucide.dev, under the ISC license
  (https://github.com/lucide-icons/lucide/blob/main/LICENSE).
- `app/public/theme.js`: the `moon` and `sun` icons of the light and dark mode
  button, embedded as SVG paths.

## Additional license notes

- `app/public/idevices/text/text.js` contains a header pointing to:
  - Creative Commons Attribution-ShareAlike 4.0
  - http://creativecommons.org/licenses/by-sa/4.0/
- The bundled `exe_math` distribution includes an Apache License 2.0 license file in the original eXeLearning source tree:
  - `https://github.com/exelearning/exelearning/blob/main/public/app/common/exe_math/LICENSE`
- The reused browser bundles and packaged resources listed under `app/public/exelearning/` are derived from the AGPL-3.0-or-later eXeLearning project and are redistributed here for compatibility and conversion support.

## Notes

- This file is provided as a practical attribution summary for reused third-party assets.
- It does not replace the original licenses distributed by their respective authors.
