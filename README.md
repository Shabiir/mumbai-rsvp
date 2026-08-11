# Mumbai RSVP — GitHub Pages

This repository hosts only the guest-facing RSVP page. Google Apps Script remains a small backend API that validates invitation codes and writes to the existing Mumbai Google Sheet. Guests visit the GitHub Pages URL, so they do not see the Google Apps Script page shell or banner.

## Files

- `index.html`, `styles.css`, `app.js` — public RSVP site
- `mumbai-invitation.png` — final invitation artwork
- `config.js` — Apps Script deployment URL

## Deployed architecture

- GitHub Pages hosts the public invitation and RSVP interface.
- Google Apps Script provides the backend API.
- The existing Google Sheet remains private and stores guest and RSVP data.

Do not add `setXFrameOptionsMode`; this design does not embed Apps Script. Apps Script's `ContentService` does not provide a supported API for setting arbitrary CORS headers. Instead, lookup uses JSONP and saving uses a simple form-encoded cross-origin POST followed by a lookup confirmation. This avoids a CORS preflight while keeping Apps Script as the backend.

## Website

`https://shabiir.github.io/mumbai-rsvp/`

## Personalized WhatsApp links

The shared link can be the base Pages URL. For a smoother experience, append each household's four-digit code:

`https://shabiir.github.io/mumbai-rsvp/?code=6193`

The code is prefilled but the invitation remains the landing screen.

## Before sending to guests

- Test a valid active code and an invalid code.
- Test Accept with 1 guest and with the maximum guest allocation.
- Test Decline.
- Reopen the link and confirm the prior RSVP loads.
- Submit an update and confirm the same response row changes rather than duplicating.
- Test on iPhone and Android over mobile data.
- Confirm the live Sheet's column positions match `CONFIG.COLUMNS`.

Invitation codes are convenient household access keys, not strong passwords. Anyone who knows a valid four-digit code can view and update that household's RSVP.
