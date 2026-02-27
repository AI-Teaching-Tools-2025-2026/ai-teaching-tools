"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * Example usage of the SubmissionModal component.
 *
 * This example demonstrates:
 * - Managing the modal's open state with React's useState.
 * - Triggering the modal via a button click.
 * - Passing content through the `body` prop.
 * - Handling asynchronous submission logic with `onSubmit`.
 *
 * const [modalOpen, setModalOpen] = useState(false);
 *
 * <Button onClick={() => setModalOpen(true)}>
 *   Open Modal
 * </Button>
 *
 * <SubmissionModal
 *   isOpen={modalOpen}
 *   onOpenChange={setModalOpen}
 *   body="This is a preview of the SubmissionModal component."
 *   onSubmit={async () => {
 *     // Simulate async submission (e.g., API request)
 *     await new Promise((resolve) => setTimeout(resolve, 500));
 *   }}
 * />
 */

type SubmissionModalProps = {
    // Tells whether modal should be open or not 
	isOpen: boolean;
    // Change open/closed state
	onOpenChange: (open: boolean) => void;
	body?: React.ReactNode;
	onSubmit: () => void | Promise<void>;
// modal will always close after a successful submit
};

function SubmissionModal({ isOpen, onOpenChange, body, onSubmit }: SubmissionModalProps) {
	const [isLoading, setIsLoading] = React.useState(false);
	const mountedRef = React.useRef(true);

	React.useEffect(() => {
		return () => {
			mountedRef.current = false;
		};
	}, []);

	const handleSubmit = async () => {
		setIsLoading(true);
		try {
			await onSubmit();
			// always close after submit completes successfully
			onOpenChange(false);
		} catch (err) {
			// swallowing error here; callers can show their own notifications
			console.error("SubmissionModal onSubmit error:", err);
		} finally {
			if (mountedRef.current) setIsLoading(false);
		}
	};

	return (
		<DialogPrimitive.Root open={isOpen} onOpenChange={onOpenChange}>
			<DialogPrimitive.Portal>
				<DialogPrimitive.Overlay
					className={cn(
						// dim the background but do not blur it
						"fixed inset-0 z-40 bg-black/50",
					)}
				/>

				<DialogPrimitive.Content
					className={cn(
						// center the dialog in the viewport so it reliably appears
						"fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg bg-background p-6 shadow-lg",
					)}
				>
					<div className="flex items-start justify-between">
						<DialogPrimitive.Title className="text-lg font-semibold">
							Are you sure?
						</DialogPrimitive.Title>
						<DialogPrimitive.Close className="rounded-xs data-[state=open]:bg-secondary opacity-70 hover:opacity-100 focus:outline-none">
							<XIcon className="size-4" />
							<span className="sr-only">Close</span>
						</DialogPrimitive.Close>
					</div>

					{body && (
						// add extra top margin so there's visible space between the title and the body
						<DialogPrimitive.Description className="mt-4 text-muted-foreground text-sm">
							{body}
						</DialogPrimitive.Description>
					)}

					<div className="mt-4 flex w-full justify-end gap-2">
						<Button variant="outline" onClick={() => onOpenChange(false)}>
							Cancel
						</Button>
						<Button onClick={handleSubmit} disabled={isLoading}>
							{isLoading ? "Submitting..." : "Confirm"}
						</Button>
					</div>
				</DialogPrimitive.Content>
			</DialogPrimitive.Portal>
		</DialogPrimitive.Root>
	);
}

export default SubmissionModal;

