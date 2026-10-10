// Copyright (c) 2026 Cloudflare, Inc.
// Licensed under the Apache 2.0 license found in the LICENSE file or at:
//     https://opensource.org/licenses/Apache-2.0

export interface Env extends Cloudflare.Env {
	POLICY_AUD: string;
	TEAM_DOMAIN: string;
	DISCORD_GLOBAL_MAILBOXES?: string;
	DISCORD_NOTIFY_MAILBOXES?: string;
	/** Set false to disable the global Discord fallback webhook. Defaults to true. */
	DISCORD_GLOBAL_ENABLED?: string;
	/** JSON object mapping mailbox addresses to Discord webhook URLs. */
	DISCORD_ROLES_MAILBOXES?: string;
}
