# Contact form email setup

The inquiry form sends its details from the website to a Google Apps Script web app. The web app runs under the deploying Google account, sends the email using `GmailApp`, and responds in a hidden frame so visitors stay on the website. WhatsApp is a separate chat link.

## Deploy the email handler

1. Sign in to the Google account that should send the inquiries and open [script.google.com](https://script.google.com).
2. Create a new project. Replace the contents of `Code.gs` with the contents of this folder's `Code.gs`.
3. `OWNER_EMAIL` is set to `Mail@sonigroups.com`. Change it only if inquiries should go to a different inbox, then save the project.
4. Choose **Deploy > New deployment**, select **Web app**, and set **Execute as** to **Me**. Set access to **Anyone**, then deploy. Google will ask you to authorize sending email for the account.
5. Copy the web app URL ending in `/exec`.
6. In the repository's `script.js`, replace `REPLACE_WITH_DEPLOYMENT_ID` in `GOOGLE_APPS_SCRIPT_URL` with the deployment URL's ID, preserving the surrounding `https://script.google.com/macros/s/` and `/exec`.
7. Publish the website update to GitHub Pages and send a test inquiry.

The endpoint must be public so the GitHub Pages form can reach it. The script validates fields, has a honeypot for simple bots, and limits successful email attempts to 30 per day. Google's Gmail sending quotas still apply and may change; consumer accounts currently have a 100-recipient-per-day limit. See [Apps Script quotas](https://developers.google.com/apps-script/guides/services/quotas).

Opening the `/exec` URL directly sends a GET request and displays a health-check page. Actual inquiry submissions use POST and are handled by `doPost`.

This implementation sends text only. Visitors cannot upload attachments through the form; they can use the separate WhatsApp chat link for other questions.
