# Mumbai RSVP — GitHub Pages

This repository hosts only the guest-facing RSVP page. Google Apps Script remains a small backend API that validates invitation codes and writes to the existing Mumbai Google Sheet. Guests visit the GitHub Pages URL, so they do not see the Google Apps Script page shell or banner.

## Files

- `index.html`, `styles.css`, `app.js` — public RSVP site
- `mumbai-invitation.png` — final invitation artwork
- `config.js` — Apps Script deployment URL
- `apps-script/Code.gs` — backend to paste into the existing Mumbai Apps Script project

## 1. Update Apps Script

1. Open the existing Mumbai Apps Script project.
2. Keep a copy of the current `Code.gs` as a backup.
3. Replace it with `apps-script/Code.gs`.
4. In `CONFIG`, paste the existing Mumbai spreadsheet ID.
5. Verify the numbered column mapping. It matches the supplied Mumbai sheet: A = Invite Code, B = Household Name, C = Greeting Name, D–I = Guest 1–6, J = Maximum Invites, K = Local / Outstation, L = Location, and M = Group. There is no Active column, so every row in `Guest_List` is treated as active.
6. Deploy as a web app: **Deploy → New deployment → Web app**.
7. Set **Execute as: Me** and **Who has access: Anyone**.
8. Copy the URL ending in `/exec`.

Do not add `setXFrameOptionsMode`; this design does not embed Apps Script. Apps Script's `ContentService` does not provide a supported API for setting arbitrary CORS headers. Instead, lookup uses JSONP and saving uses a simple form-encoded cross-origin POST followed by a lookup confirmation. This avoids a CORS preflight while keeping Apps Script as the backend.

## 2. Configure the website

1. Paste the `/exec` URL into `config.js`.
2. The final invitation image is already stored as `mumbai-invitation.png`.
3. Test locally by opening `index.html` or serving the folder with a basic local web server.

## 3. Publish free with GitHub Pages

1. Create a public GitHub repository, for example `mumbai-rsvp`.
2. Upload these files to the repository root.
3. In the repository, open **Settings → Pages**.
4. Under **Build and deployment**, select **Deploy from a branch**.
5. Select branch `main`, folder `/ (root)`, then **Save**.
6. After GitHub finishes publishing, the free URL will be:
   `https://YOUR-GITHUB-USERNAME.github.io/mumbai-rsvp/`

The exact GitHub menus can change; verify against GitHub's current Pages settings if labels differ.

## Personalized WhatsApp links

The shared link can be the base Pages URL. For a smoother experience, append each household's four-digit code:

`https://YOUR-GITHUB-USERNAME.github.io/mumbai-rsvp/?code=6193`

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
