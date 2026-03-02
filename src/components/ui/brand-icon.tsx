import { cn } from "@/utils/style";

type Props = React.ComponentProps<"span"> & {
	variant?: "logo" | "icon";
};

export function BrandIcon({ variant = "logo", className, ...props }: Props) {
	return (
		<span
			className={cn(
				"inline-flex items-center justify-center font-headline text-foreground uppercase leading-none tracking-tight",
				variant === "icon" ? "text-lg" : "text-2xl",
				className,
			)}
			aria-label="Ascend"
			{...props}
		>
			{variant === "icon" ? "A" : "Ascend"}
		</span>
	);
}
