# Chrome Web Store Listing — Add QR Code Generator Icon Back To Address Bar

> Last Updated: 2026-11-19

## Store Listing

**Extension Name** [REQUIRED]
Add QR Code Generator Icon Back To Address Bar

**Short Description** [REQUIRED]
Generate Chromium-style QR codes for the current page or any text. Copy, download, SVG export, and batch generation.

**Detailed Description** [REQUIRED]
Bring back the Chromium-style QR code generator to your browser's address bar. This extension recreates the exact look of Chrome's native QR codes — round modules, rounded finder patterns, and the iconic Chrome dinosaur in the center.

Create a QR code in one click for the current page, or type any text or URL. Copy it as a crisp PNG image, download it with a smart filename, or customize the style (module shape, corner style, and colors). Decode QR codes from an uploaded image or directly from the current page. Right-click any page or selection, or type "qr" in the address bar, to create a QR code instantly.

Free features include QR codes for the current page or any text, copy and download as PNG, style customization, right-click and address-bar shortcuts, QR decoding, and a 50-item generation history.

QR Code Generator Pro is a one-time $9.99 purchase (no subscription, no auto-renewal) that unlocks SVG vector export, high-resolution PNG export (2x/4x), batch generation (ZIP), contact (vCard) and calendar-event QR codes, and a 500-item history.

Everything is generated locally on your device. No account, no analytics, no tracking.

**Category** [REQUIRED]
Productivity

**Single Purpose** [REQUIRED]
Generate and read QR codes for the current page or any text.

**Primary Language** [REQUIRED]
English

## Graphics & Assets

| Asset | Dimensions | Status | Filename |
|-------|-----------|--------|----------|
| Store Icon [REQUIRED] | 128×128 PNG | ✅ Ready | `public/icon/128.png` |
| Screenshot 1 [REQUIRED] | 1280×800 or 640×400 | ⬜ Not created | |
| Screenshot 2 [RECOMMENDED] | 1280×800 or 640×400 | ⬜ Not created | |
| Screenshot 3 [RECOMMENDED] | 1280×800 or 640×400 | ⬜ Not created | |
| Small Promo Tile [RECOMMENDED] | 440×280 | ⬜ Not created | |
| Marquee Promo Tile | 1400×560 | ⬜ Not created | |

### Screenshot Notes
- Screenshot 1: The popup showing a QR code generated for the current page URL (with the Chrome dinosaur center logo).
- Screenshot 2: The options page showing style customization (module shape, corner style, colors) and the Pro license section.
- Screenshot 3: The popup's Decode tab, or the Batch tab showing multiple items being exported.

## Permissions Justification

| Permission | Type | Justification |
|------------|------|---------------|
| activeTab | permissions | Read the current page's URL to pre-fill the QR code — granted only when the user clicks the icon or uses a context menu item. |
| storage | permissions | Save the user's QR style preferences (logo, shape, colors) and generation history locally. |
| contextMenus | permissions | Add "Create QR code for this page" and "Create QR code for selected text" items to the right-click menu. |
| `<all_urls>` (content script matches) | content_scripts | The "decode from current page" feature scans images and canvases on the page the user is viewing. The content script is idle until the user clicks the "Decode current page" button; it does not run any logic on page load. |

## Privacy & Data Use

### Data Collection

**Does the extension collect user data?** Yes — minimal, and only when the user activates Pro.

| Data Type | Collected? | Transmitted Off-Device? | Purpose | Shared with Third Parties? |
|-----------|-----------|------------------------|---------|---------------------------|
| Personally identifiable info | No | No | — | No |
| Health info | No | No | — | No |
| Financial info | No | No | — | No |
| Authentication info | Yes (license key only, when the user activates Pro) | Yes (to the license server) | Verify and bind the Pro license | No |
| Personal communications | No | No | — | No |
| Location | No | No | — | No |
| Web history | No | No | — | No |
| User activity | No | No | — | No |
| Website content | No | No | — | No |

### Data Use Certification
- [x] Data is NOT sold to third parties
- [x] Data is NOT used for purposes unrelated to the extension's core functionality
- [x] Data is NOT used for creditworthiness or lending purposes

### Additional Notes
- QR codes are generated entirely on-device; the text or URL the user encodes never leaves the browser.
- `chrome.storage.sync` is used for preferences, which syncs through Google's sync system.
- Pro activation sends only the license key and a random device identifier to the license server (`license.add-qr-code-generator-icon-back-to-address-bar.dev`).

## Privacy Policy

**Privacy Policy URL** [REQUIRED]
https://add-qr-code-generator-icon-back-to-address-bar.dev/privacy.html

## Distribution

**Visibility**: Public
**Regions**: All regions

## Developer Info

**Publisher Name** [REQUIRED]
<!-- [TO CONFIRM] The publisher name as registered in the Chrome Web Store developer account. -->

**Contact Email** [REQUIRED]
liuliang@webfrontend.dev

**Support URL** [RECOMMENDED]
https://github.com/chromium-style-qrcode/add-qrcode-generator-icon-back-to-address-bar/issues

**Homepage URL** [RECOMMENDED]
https://add-qr-code-generator-icon-back-to-address-bar.dev/

## Version History

| Version | Date | Changes | Status |
|---------|------|---------|--------|
| 2.0.0 | 2026-11-19 | Add Pro tier ($9.99 one-time): SVG export, high-res PNG, batch ZIP, vCard/calendar, 500-item history. Add QR decoding (upload + current page), right-click context menu, address-bar "qr" command, style customization, history search. Full i18n (7 languages). | Draft |
| 1.6.0 | 2026-02-07 | Add Japanese, Portuguese, French, and Hindi translations. | Published |
| 1.5.0 | 2026-01-24 | Add uninstall feedback form URL. | Published |
| 1.4.0 | 2025-12-12 | Add custom logo upload. | Published |

## Review Notes

### Known Issues / Limitations
- On `chrome://` and other restricted internal pages, the current page URL cannot be read (a Chrome security limitation), so auto-fill is empty; the popup shows a hint and the user can type text manually.
- The "decode current page" content script is registered on all URLs but only activates on the user's explicit "Decode current page" action.

### Rejection History
<!-- None yet. -->
