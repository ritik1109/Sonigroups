const OWNER_EMAIL = 'Mail@sonigroups.com';
const DAILY_INQUIRY_LIMIT = 30;

/**
 * Receives the contact form, validates it, and emails the business owner.
 * The result is sent back to the website through the hidden response frame.
 */
function doPost(e) {
    const parameters = e && e.parameter ? e.parameter : {};
    const requestId = String(parameters.requestId || '').slice(0, 100);

    if (String(parameters.website || '').trim()) {
        return resultPage(requestId, true, 'Thank you. Your inquiry has been sent to our team.');
    }

    const name = validateField(parameters.name, 'Name', 120, true);
    const phone = validateField(parameters.phone, 'Phone', 30, true);
    const email = validateField(parameters.email, 'Email', 254, false);
    const message = validateField(parameters.message, 'Message', 5000, true);
    const invalidField = [name, phone, email, message].find(function (field) {
        return field.error;
    });

    if (invalidField) {
        return resultPage(requestId, false, invalidField.error);
    }

    if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        return resultPage(requestId, false, 'Please enter a valid email address.');
    }

    try {
        if (!takeDailySlot_()) {
            return resultPage(requestId, false, 'The inquiry limit has been reached. Please try again tomorrow.');
        }

        const body = [
            'New inquiry from sonigroups.com',
            '',
            'Name: ' + name.value,
            'Phone: ' + phone.value,
            email.value ? 'Email: ' + email.value : null,
            '',
            'Message:',
            message.value
        ].filter(function (line) {
            return line !== null;
        }).join('\n');

        const options = {};
        if (email.value) {
            options.replyTo = email.value;
        }

        GmailApp.sendEmail(
            OWNER_EMAIL,
            'New website inquiry from sonigroups.com',
            body,
            options
        );

        return resultPage(requestId, true, 'Thank you. Your inquiry has been sent to our team.');
    } catch (error) {
        console.error('Contact inquiry email failed: ' + error.message);
        return resultPage(requestId, false, 'We could not send your inquiry. Please try again later.');
    }
}

/**
 * Ensures submitted fields are text and stay within their allowed lengths.
 */
function validateField(value, field, maxLength, required) {
    if (typeof value !== 'string') {
        return { error: field + ' must be text.' };
    }

    const text = value.trim();
    if (required && !text) {
        return { error: field + ' is required.' };
    }
    if (text.length > maxLength) {
        return { error: field + ' must be ' + maxLength + ' characters or fewer.' };
    }

    return { value: text };
}

/**
 * Uses a script lock to cap email submissions across visitors each day.
 */
function takeDailySlot_() {
    const lock = LockService.getScriptLock();
    if (!lock.tryLock(5000)) {
        throw new Error('Could not acquire the inquiry rate-limit lock.');
    }

    try {
        const date = Utilities.formatDate(new Date(), 'Etc/UTC', 'yyyy-MM-dd');
        const properties = PropertiesService.getScriptProperties();
        const key = 'inquiry-count-' + date;
        const count = Number(properties.getProperty(key) || 0);
        if (count >= DAILY_INQUIRY_LIMIT) {
            return false;
        }

        properties.setProperty(key, String(count + 1));
        return true;
    } finally {
        lock.releaseLock();
    }
}

/**
 * Returns a small page that sends the result to the parent website.
 */
function resultPage(requestId, ok, message) {
    const payload = JSON.stringify({
        type: 'sonigroups-inquiry-result',
        requestId: requestId,
        ok: ok,
        message: message
    }).replace(/</g, '\\u003c');
    const html = '<!doctype html><html><body><script>' +
        'window.top.postMessage(' + payload + ', "*");' +
        '</script></body></html>';

    return HtmlService.createHtmlOutput(html)
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
