# Terra: visual assets and attribution

Retrieved 2026-10-31. These local resources do not depend on third-party requests during normal use.

## Earth day texture

- Local file: `earth-day.jpg`, 2048 × 1024 pixels, JPEG.
- Subject: Blue Marble: Next Generation, January 2004 global base map with topographic shading. This is a historical composite, not live imagery.
- Official source page: https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/base-topography/
- Original source file (5400 × 2700): https://assets.science.nasa.gov/content/dam/science/esd/eo/images/bmng/bmng-topography/january/world.topo.200401.3x5400x2700.jpg
- Collection, production details and requested credit: https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/
- Credit to include in platform sources: **NASA Earth Observatory; Reto Stöckli. Blue Marble: Next Generation (January 2004).**
- Reuse policy: NASA Earth Science FAQ permits republication/reuse of its original material unless a copyright notice states otherwise, and asks that NASA be credited. No third-party copyright notice was shown for this collection. Policy: https://science.nasa.gov/earth/faq/
- Processing performed: downsampled with Lanczos to 2048 × 1024 and JPEG-encoded at quality 89. Geographic content was not redrawn, recolored, or generated with AI.
- NASA logos, seals and official endorsement are not included.

## Optional elevation texture

- Local file: `earth-elevation.jpg`, 2048 × 1024 pixels, grayscale JPEG.
- Official source page: https://science.nasa.gov/earth/earth-observatory/blue-marble-next-generation/topography-bathymetry-maps/
- Original source file: https://assets.science.nasa.gov/content/dam/science/esd/eo/images/bmng/topography/gebco_08_rev_elev_5400x2700.jpg
- The source page identifies land topography and data scaled from 0–6400 metres. Use only as a modest illustrative bump map, never as a correctly scaled scientific elevation model.
- Credit: **NASA Earth Observatory; GEBCO / British Oceanographic Data Centre.** The source page credits imagery by Jesse Allen using GEBCO data in its topography/bathymetry collection.
- Reuse policy: NASA Earth Science FAQ linked above; retain attribution.
- Processing performed: downsampled with Lanczos, converted to grayscale, JPEG quality 85. This optional asset may be omitted from rendering.

## Fonts

### Barlow Condensed

- Files: `barlow-condensed-600-latin.woff2`, `barlow-condensed-700-latin.woff2`.
- Copyright 2017 The Barlow Project Authors: https://github.com/jpt/barlow
- License: SIL Open Font License 1.1, full unmodified text in `barlow-condensed-OFL.txt`.
- Official license source: https://github.com/google/fonts/blob/main/ofl/barlowcondensed/OFL.txt
- Local binaries downloaded unchanged from the official Google Fonts CSS endpoint:
  - https://fonts.gstatic.com/s/barlowcondensed/v13/HTxwL3I-JCGChYJ8VI-L6OO_au7B4873z3bWuQ.woff2
  - https://fonts.gstatic.com/s/barlowcondensed/v13/HTxwL3I-JCGChYJ8VI-L6OO_au7B46r2z3bWuQ.woff2

### Nunito Sans

- File: `nunito-sans-latin.woff2`.
- Project: https://github.com/googlefonts/NunitoSans
- License: SIL Open Font License 1.1, full unmodified text in `nunito-sans-OFL.txt`.
- Official license source: https://github.com/google/fonts/blob/main/ofl/nunitosans/OFL.txt
- Binary from official Google Fonts CSS endpoint: https://fonts.gstatic.com/s/nunitosans/v19/pe0TMImSLYBIv1o4X1M8ce2xCx3yop4tQpF_MeTm0lfGWVpNn64CL7U8upHZIbMV51Q42ptCp7t1R-s.woff2
- The same Google Fonts Latin binary is supplied for 400, 600 and 700 weights. The Latin subset covers Spanish accented vowels, ñ, ¡ and ¿.

`fonts.css` defines local @font-face rules. Keep the OFL texts with any redistributed project.

## Verification

- Both JPEGs decoded successfully with Pillow; original dimensions were 5400 × 2700; deliverables are 2048 × 1024.
- Font binary URLs were obtained from Google Fonts' own stylesheet rather than guessed or copied from an unrelated site.
- License files were downloaded from the official `google/fonts` repository.
- No AI-generated image is being used as Earth geography or scientific evidence.

## Runtime presentation

The renderer adapts dark-blue ocean pixels to a lighter illustrative blue for readability. The source JPEG remains unchanged. Colors are educational and must not be interpreted as measurements. The geometry uses schematic layer thicknesses.
