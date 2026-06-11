import type { Env } from "../types";

/** TODO: move to DISCORD_WEBHOOK_URL secret — hardcoded for now. */
const DISCORD_WEBHOOK_URL =
	"https://discord.com/api/webhooks/1514765765306486866/u4T0DNYWgQ2zgyqq_samUD6qA9m_6ks3AUZdMxuHBWjmHyEyDa_N8UdXPrjz6SKVYp89";

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
	const webhookUrl = env.DISCORD_WEBHOOK_URL?.trim() || DISCORD_WEBHOOK_URL;

	const allowlist = parseMailboxAllowlist(env.DISCORD_NOTIFY_MAILBOXES);
	if (allowlist && !allowlist.has(payload.mailboxId.toLowerCase())) {
		return;
	}

	const content = buildMessage(payload);

	try {
		const res = await fetch(webhookUrl, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ content }),
		});

		if (!res.ok) {
			const body = await res.text().catch(() => "");
			console.error("[discord] notify failed:", res.status, body.slice(0, 200));
		}
	} catch (err) {
		console.error("[discord] notify error:", (err as Error).message);
	}
}
