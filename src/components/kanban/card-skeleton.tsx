import { Skeleton } from "@/components/ui/skeleton";

export function CardSkeleton() {
	return (
		<div className="rounded-lg border bg-card p-3">
			<Skeleton className="mb-1 h-4 w-3/4" />
			<Skeleton className="mb-2 h-3 w-1/2" />
			<div className="flex gap-1.5">
				<Skeleton className="h-5 w-16 rounded-full" />
				<Skeleton className="h-5 w-12 rounded-full" />
			</div>
		</div>
	);
}
