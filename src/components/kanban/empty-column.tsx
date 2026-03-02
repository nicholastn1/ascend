import { Trans } from "@lingui/react/macro";
import { TrayIcon } from "@phosphor-icons/react";

export function EmptyColumn() {
	return (
		<div className="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground">
			<TrayIcon className="size-8" />
			<p className="text-xs">
				<Trans>No applications</Trans>
			</p>
		</div>
	);
}
