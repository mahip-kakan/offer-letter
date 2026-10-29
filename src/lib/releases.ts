// Where Offer Letter's releases are published, for the update check and its
// notice (update-check.ts, the sidebar). Safe to use in the browser.

export const RELEASES_REPOSITORY = "mahip-kakan/offer-letter";
/** The repository's page, for credits and support (the sidebar). */
export const REPOSITORY_URL = `https://github.com/${RELEASES_REPOSITORY}`;
/** How to update. The repository page. */
export const UPGRADE_GUIDE_URL = "https://github.com/mahip-kakan/offer-letter";

/** A published release: its version, without the "v", and its page on GitHub. */
export type Release = { version: string; url: string };
