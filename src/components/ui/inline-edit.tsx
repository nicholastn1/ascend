import { CheckIcon, XIcon } from "@phosphor-icons/react";
import { type ReactNode, useCallback, useEffect, useRef } from "react";
import { cn } from "@/utils/style";
import { Button } from "./button";

type InlineEditProps = {
	readView: ReactNode;
	editView: ReactNode;
	isEditing: boolean;
	onEdit: () => void;
	onConfirm: () => void;
	onCancel: () => void;
	isLoading?: boolean;
	showActions?: boolean;
};

export function InlineEdit({
	readView,
	editView,
	isEditing,
	onEdit,
	onConfirm,
	onCancel,
	isLoading = false,
	showActions = true,
}: InlineEditProps) {
	const containerRef = useRef<HTMLDivElement>(null);

	const handleClickOutside = useCallback(
		(event: MouseEvent) => {
			if (!isEditing) return;
			const target = event.target as Node;
			if (!containerRef.current?.contains(target)) {
				// Ignore clicks inside Radix portalled content (popover, dropdown, etc.)
				// so dropdown options don't trigger cancel when rendered outside the container
				const isInPortal = (target as Element).closest?.(
					"[data-slot='popover-content'], [data-radix-popper-content-wrapper]",
				);
				if (!isInPortal) onCancel();
			}
		},
		[isEditing, onCancel],
	);

	useEffect(() => {
		if (isEditing) {
			document.addEventListener("mousedown", handleClickOutside);
			return () => document.removeEventListener("mousedown", handleClickOutside);
		}
	}, [isEditing, handleClickOutside]);

	const handleKeyDown = useCallback(
		(event: React.KeyboardEvent) => {
			if (!isEditing) return;
			if (event.key === "Enter" && !event.shiftKey) {
				event.preventDefault();
				onConfirm();
			}
			if (event.key === "Escape") {
				event.preventDefault();
				onCancel();
			}
		},
		[isEditing, onConfirm, onCancel],
	);

	if (!isEditing) {
		return (
			<button
				type="button"
				onClick={onEdit}
				className={cn(
					"w-full cursor-pointer rounded px-2 py-1 text-left transition-colors hover:bg-secondary/40",
					isLoading && "pointer-events-none opacity-60",
				)}
			>
				{readView}
			</button>
		);
	}

	return (
		<div ref={containerRef} className="flex items-start gap-1" onKeyDown={handleKeyDown}>
			<div className="min-w-0 flex-1">{editView}</div>
			{showActions && (
				<div className="flex shrink-0 items-center gap-0.5 pt-1">
					<Button type="button" variant="ghost" size="icon" className="size-7" onClick={onConfirm} disabled={isLoading}>
						<CheckIcon className="size-4" />
					</Button>
					<Button type="button" variant="ghost" size="icon" className="size-7" onClick={onCancel} disabled={isLoading}>
						<XIcon className="size-4" />
					</Button>
				</div>
			)}
		</div>
	);
}
