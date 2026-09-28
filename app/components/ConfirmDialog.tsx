import { Button, Dialog } from "@cloudflare/kumo";
import { useState, type ReactNode } from "react";

interface ConfirmDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description: ReactNode;
	confirmLabel?: string;
	confirmVariant?: "primary" | "destructive";
	onConfirm: () => void | Promise<void>;
}

export default function ConfirmDialog({
	open,
	onOpenChange,
	title,
	description,
	confirmLabel = "Confirm",
	confirmVariant = "destructive",
	onConfirm,
}: ConfirmDialogProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleConfirm = async () => {
		setIsSubmitting(true);
		try {
			await onConfirm();
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog size="sm" className="p-6">
				<Dialog.Title className="text-base font-semibold mb-2">
					{title}
				</Dialog.Title>
				<Dialog.Description className="text-kumo-subtle text-sm mb-5">
					{description}
				</Dialog.Description>
				<div className="flex justify-end gap-2">
					<Dialog.Close
						render={(props) => (
							<Button {...props} variant="secondary" size="sm">
								Cancel
							</Button>
						)}
					/>
					<Button
						variant={confirmVariant}
						size="sm"
						loading={isSubmitting}
						onClick={handleConfirm}
					>
						{confirmLabel}
					</Button>
				</div>
			</Dialog>
		</Dialog.Root>
	);
}
