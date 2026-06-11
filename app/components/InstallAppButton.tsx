import { Button } from "@cloudflare/kumo";
import { DownloadSimpleIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { PWA_APP_NAME } from "~/lib/pwa-brand";

type BeforeInstallPromptEvent = Event & {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isIosStandalone(): boolean {
	if (typeof window === "undefined") return false;
	const nav = window.navigator as Navigator & { standalone?: boolean };
	return nav.standalone === true;
}

function isInstalledPwa(): boolean {
	if (typeof window === "undefined") return false;
	return (
		isIosStandalone() ||
		window.matchMedia("(display-mode: standalone)").matches ||
		window.matchMedia("(display-mode: fullscreen)").matches
	);
}

function isIosSafari(): boolean {
	if (typeof window === "undefined") return false;
	const ua = window.navigator.userAgent;
	return /iPad|iPhone|iPod/.test(ua) && !(window as Window & { MSStream?: unknown }).MSStream;
}

type InstallAppButtonProps = {
	className?: string;
};

export default function InstallAppButton({ className }: InstallAppButtonProps) {
	const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(
		null,
	);
	const [installed, setInstalled] = useState(false);
	const [showIosHint, setShowIosHint] = useState(false);

	useEffect(() => {
		setInstalled(isInstalledPwa());

		const onBeforeInstall = (event: Event) => {
			event.preventDefault();
			setInstallEvent(event as BeforeInstallPromptEvent);
		};

		const onInstalled = () => {
			setInstallEvent(null);
			setInstalled(true);
		};

		window.addEventListener("beforeinstallprompt", onBeforeInstall);
		window.addEventListener("appinstalled", onInstalled);

		return () => {
			window.removeEventListener("beforeinstallprompt", onBeforeInstall);
			window.removeEventListener("appinstalled", onInstalled);
		};
	}, []);

	if (installed) return null;

	const handleInstall = async () => {
		if (installEvent) {
			await installEvent.prompt();
			await installEvent.userChoice;
			setInstallEvent(null);
			return;
		}

		if (isIosSafari()) {
			setShowIosHint((value) => !value);
		}
	};

	const showButton = Boolean(installEvent) || isIosSafari();
	if (!showButton) return null;

	return (
		<div className={className ? `relative ${className}` : "relative"}>
			<Button
				variant="secondary"
				size="sm"
				icon={<DownloadSimpleIcon size={16} />}
				onClick={() => void handleInstall()}
			>
				Install app
			</Button>
			{showIosHint && (
				<p className="absolute right-0 top-full z-20 mt-2 w-56 rounded-lg border border-kumo-line bg-kumo-base p-3 text-xs text-kumo-subtle shadow-lg">
					On iPhone/iPad: tap Share, then &quot;Add to Home Screen&quot; to install{" "}
					{PWA_APP_NAME}.
				</p>
			)}
		</div>
	);
}
