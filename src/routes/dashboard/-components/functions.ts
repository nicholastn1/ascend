const STORAGE_KEY = "ascend:sidebar_state";

export function getSidebarState(): boolean {
	if (typeof window === "undefined") return true;
	return localStorage.getItem(STORAGE_KEY) !== "false";
}

export function setSidebarState(open: boolean) {
	localStorage.setItem(STORAGE_KEY, open.toString());
}
