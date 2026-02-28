/**
 * Converts an ArrayBuffer to a base64 string.
 *
 * Uses chunked processing to avoid "Maximum call stack size exceeded" errors
 * that occur when spreading large Uint8Arrays into String.fromCharCode().
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
	const bytes = new Uint8Array(buffer);
	const chunkSize = 8192;
	let binary = "";

	for (let i = 0; i < bytes.length; i += chunkSize) {
		binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
	}

	return btoa(binary);
}
