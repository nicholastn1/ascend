import { t } from "@lingui/core/macro";
import { MagnifyingGlassIcon, XIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { useDebounceCallback } from "usehooks-ts";
import { Input } from "@/components/ui/input";

type SearchBarProps = {
	value: string;
	onValueChange: (value: string) => void;
};

export function SearchBar({ value, onValueChange }: SearchBarProps) {
	const [localValue, setLocalValue] = useState(value);
	const debouncedOnChange = useDebounceCallback(onValueChange, 300);

	useEffect(() => {
		setLocalValue(value);
	}, [value]);

	const handleChange = (newValue: string) => {
		setLocalValue(newValue);
		debouncedOnChange(newValue);
	};

	return (
		<div className="relative">
			<MagnifyingGlassIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
			<Input
				value={localValue}
				onChange={(e) => handleChange(e.target.value)}
				placeholder={t`Search by company or job title...`}
				className="pr-8 pl-9"
			/>
			{localValue && (
				<button
					type="button"
					onClick={() => handleChange("")}
					className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
				>
					<XIcon className="size-3.5" />
				</button>
			)}
		</div>
	);
}
