import type { Env } from "../types";

export type DiscordNewEmailPayload = {
	mailboxId: string;
	sender: string;
	subject: string;
};

function parseMailboxAllowlist(raw: string | undefined): Set<string> | null {
	const list = (raw ?? "")
		.split(",")
		.map((entry) => entry.trim().toLowerCase())
		.filter(Boolean);
	return list.length > 0 ? new Set(list) : null;
}

function parseMailboxWebhooks(raw: string | undefined): Record<string, string> {
	if (!raw?.trim()) return {};

	try {
		const parsed: unknown = JSON.parse(raw);
		if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};

		return Object.fromEntries(
			Object.entries(parsed as Record<string, unknown>)
				.filter(([, value]) => typeof value === "string" && value.trim())
				.map(([mailboxId, webhook]) => [mailboxId.trim().toLowerCase(), (webhook as string).trim()]),
		);
	} catch {
		console.error("[discord] invalid DISCORD_ROLES_MAILBOXES JSON");
		return {};
	}
}

function isEnabled(raw: string | undefined): boolean {
	if (!raw?.trim()) return true;
	return ["true", "1", "yes", "on"].includes(raw.trim().toLowerCase());
}

function buildMessage({ sender, subject }: DiscordNewEmailPayload): string {
	const from = sender.trim() || "unknown sender";
	const trimmedSubject = subject.trim() || "(no subject)";
	return `${from} - ${trimmedSubject}`;
}

/** Post a minimal Discord alert when inbound mail is stored. Best-effort; never throws. */
export async function notifyDiscordNewEmail(
	env: Env,
	payload: DiscordNewEmailPayload,
): Promise<void> {
	const mailboxId = payload.mailboxId.trim().toLowerCase();
	const mailboxWebhook = parseMailboxWebhooks(env.DISCORD_ROLES_MAILBOXES)[mailboxId];

	// Mailbox-specific routes are always active and bypass the global toggle and allowlist.
	if (!mailboxWebhook) {
		const allowlist = parseMailboxAllowlist(env.DISCORD_NOTIFY_MAILBOXES);
		if (allowlist && !allowlist.has(mailboxId)) return;
		if (!isEnabled(env.DISCORD_GLOBAL_ENABLED)) return;
	}

	const webhookUrl = mailboxWebhook || env.DISCORD_GLOBAL_MAILBOXES?.trim();
	if (!webhookUrl) {
		console.warn("[discord] no webhook configured; skipping notification");
		return;
	}

	try {
		const res = await fetch(webhookUrl, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ content: buildMessage(payload) }),
		});

		if (!res.ok) {
			const body = await res.text().catch(() => "");
			console.error("[discord] notify failed:", res.status, body.slice(0, 200));
		}
	} catch (err) {
		console.error("[discord] notify error:", (err as Error).message);
	}
}
