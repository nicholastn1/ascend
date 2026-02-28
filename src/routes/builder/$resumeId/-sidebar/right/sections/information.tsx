import { Trans } from "@lingui/react/macro";
import { SectionBase } from "../shared/section-base";

export function InformationSectionBuilder() {
	return (
		<SectionBase type="information" className="space-y-4">
			<div className="space-y-2 rounded-md border bg-sky-600 p-5 text-white dark:bg-sky-700">
				<h4 className="font-medium tracking-tight">
					<Trans>Welcome to Reactive Resume!</Trans>
				</h4>

				<div className="space-y-2 text-xs leading-normal">
					<Trans>
						<p>
							Create, customize, and share your professional resume. Use the editor on the left to add your information
							and see the live preview update in real time.
						</p>
					</Trans>
				</div>
			</div>
		</SectionBase>
	);
}
