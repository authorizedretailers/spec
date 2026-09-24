const DAY_MS = 24 * 60 * 60 * 1000;

/** Section 10: maximum expiry is 180 days from issue. */
export const MAX_EXPIRY_MS = 180 * DAY_MS;
/** Section 10: recommended default expiry. */
export const DEFAULT_EXPIRY_MS = 90 * DAY_MS;
/** Section 9: a verify answer's valid_until is at most 24 hours after checked. */
export const MAX_ANSWER_VALIDITY_MS = DAY_MS;
