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
