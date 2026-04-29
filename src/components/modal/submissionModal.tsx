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
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  body?: React.ReactNode;
  onSubmit: () => void | Promise<void>;
};

function SubmissionModal({
  isOpen,
  onOpenChange,
  body,
  onSubmit,
}: SubmissionModalProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const mountedRef = React.useRef(true);

  React.useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  React.useEffect(() => {
    setIsLoading(false);
  }, [isOpen]);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await onSubmit();
      onOpenChange(false);
    } catch (err) {
      console.error("SubmissionModal onSubmit error:", err);
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  };

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn("fixed inset-0 z-40 bg-black/50")}
        />

        <DialogPrimitive.Content
          aria-describedby={undefined}
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg bg-background p-6 shadow-lg",
          )}
        >
          <div className="flex items-start justify-between">
            <DialogPrimitive.Title className="text-lg font-semibold">
              Are you sure?
            </DialogPrimitive.Title>

            <DialogPrimitive.Close className="rounded-xs opacity-70 hover:opacity-100 focus:outline-none">
              <XIcon className="size-4" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          </div>

          {body && (
            <div className="mt-4 text-sm text-muted-foreground">{body}</div>
          )}

          <div className="mt-4 flex w-full justify-end gap-2">
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => onOpenChange(false)}
            >
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
