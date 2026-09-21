const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

function isValidEmail(email) {
    return typeof email === "string" && EMAIL_RE.test(email.trim());
}

function isValidUsername(username) {
    return typeof username === "string" && USERNAME_RE.test(username.trim());
}

function isNonEmptyString(value, maxLength = 5000) {
    return typeof value === "string" && value.trim().length > 0 && value.trim().length <= maxLength;
}

module.exports = { isValidEmail, isValidUsername, isNonEmptyString };
