/** Site + PWA branding (single source of truth). */
export const SITE_TITLE = "Hurayarah Inbox";
export const PWA_APP_NAME = SITE_TITLE;
export const PWA_APP_SHORT_NAME = "Inbox";
export const PWA_THEME_COLOR = "#f6821f";
export const PWA_BACKGROUND_COLOR = "#f5f5f5";
export const PWA_APP_DESCRIPTION =
	"Hurayarah Inbox — AI-powered email for hurayarah.dev.";

/** Browser tab title for a page, e.g. "Inbox · Hurayarah Inbox". */
export function documentTitle(page?: string): string {
	return page ? `${page} · ${SITE_TITLE}` : SITE_TITLE;
}
