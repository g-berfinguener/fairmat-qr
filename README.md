# FAIRmat QR Codes

Make QR codes in the FAIRmat house style for posters, slides and flyers.

## How to use it

1. **Paste your link** into the Link field.
2. **Pick a logo** for the centre: FAIRmat, another team logo, or No logo.
3. **Pick a corner colour:** green for NOMAD Oasis, gold for NOMAD CAMELS, blue for everything else.
4. **Download** as PNG for slides and Google Slides, or SVG for print and design tools.

The download buttons only work once the page says **Scans correctly**. Every code is checked by a scanner first, so a downloaded code always works.

## Tips

- Shorter links give simpler codes that scan faster.
- If a code doesn't scan, shorten the link or choose No logo.
- Want a logo that isn't in the list? Click **Use another logo** and pick the file. It's only used in your browser and isn't saved or shared.

## Privacy

Everything happens in your browser. The links you type and the logos you add are not sent anywhere.

## Adding a team logo for everyone

1. Upload the official logo file (SVG is best) to the `logos` folder.
2. Add a line for it in `logos/logos.js`, for example:

   ```js
   { name: "NOMAD Oasis", file: "nomad-oasis.svg" },
   ```

The new logo appears on the page a minute or two later.

## Credits

QR generation by [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) (MIT), scanning by [jsQR](https://github.com/cozmo/jsQR) (Apache 2.0), font Titillium Web (SIL Open Font Licence).
