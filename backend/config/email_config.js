const { google } = require("googleapis");

const auth = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URI
);

auth.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN
});

/**
 * Very strict email validation
 */
function isValidEmail(email) {
    return /^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(email);
}

/**
 * Normalize + validate To header
 */
function normalizeTo(to) {
    if (!to) {
        throw new Error(`Invalid To header: value is ${to}`);
    }

    // Handle array
    if (Array.isArray(to)) {
        if (to.length === 0) {
            throw new Error("Invalid To header: empty array");
        }

        to.forEach(email => {
            if (!isValidEmail(email)) {
                throw new Error(`Invalid To email: "${email}"`);
            }
        });

        return to.join(", ");
    }

    // String
    const cleaned = String(to).trim();

    if (!isValidEmail(cleaned)) {
        throw new Error(`Invalid To email: "${cleaned}"`);
    }

    return cleaned;
}

/**
 * Normalize From header
 * Gmail REQUIRES this to match the authenticated account or alias
 */
function normalizeFrom(from) {
    if (!from) {
        throw new Error("Missing From header");
    }

    const match = from.match(/<(.+?)>/);
    const email = match ? match[1] : from;

    if (!isValidEmail(email)) {
        throw new Error(`Invalid From email: "${from}"`);
    }

    return from;
}

async function sendMail(from, to, subject, html) {
    if (!subject || !html) {
        throw new Error("Missing subject or html body");
    }

    const gmail = google.gmail({ version: "v1", auth });

    const safeFrom = normalizeFrom(from);
    const safeTo = normalizeTo(to);


    const messageParts = [
        `From: ${safeFrom}`,
        `To: ${safeTo}`,
        `Subject: ${subject}`,
        "MIME-Version: 1.0",
        "Content-Type: text/html; charset=UTF-8",
        "",
        html
    ];

    const message = messageParts.join("\r\n");

    const encodedMessage = Buffer.from(message)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

    await gmail.users.messages.send({
        userId: "me",
        requestBody: {
            raw: encodedMessage
        }
    });
}

module.exports = sendMail;
