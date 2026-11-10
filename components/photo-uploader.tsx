"use client";

import { useState } from "react";

const MAX_EDGE = 1600;

/**
 * Shrinks a camera photo before upload. A 4 MB phone photo becomes roughly
 * 200 to 400 KB, which matters on a scout's mobile data.
 */
async function shrink(file: File): Promise<Blob> {
	try {
		const bitmap = await createImageBitmap(file);
		const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
		const canvas = document.createElement("canvas");
		canvas.width = Math.round(bitmap.width * scale);
		canvas.height = Math.round(bitmap.height * scale);
		canvas
			.getContext("2d")
			?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
		const blob = await new Promise<Blob | null>((resolve) =>
			canvas.toBlob(resolve, "image/jpeg", 0.82),
		);
		if (blob) return blob;
	} catch {
		// Fall through and send the original file.
	}
	return file;
}

async function upload(file: File): Promise<string> {
	const blob = await shrink(file);
	const ticketResponse = await fetch("/api/media", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ type: blob.type, size: blob.size }),
	});
	if (!ticketResponse.ok) throw new Error("No upload ticket");
	const ticket = (await ticketResponse.json()) as {
		uploadUrl: string;
		publicUrl: string;
	};
	const sent = await fetch(ticket.uploadUrl, {
		method: "PUT",
		headers: { "Content-Type": blob.type },
		body: blob,
	});
	if (!sent.ok) throw new Error("Upload failed");
	return ticket.publicUrl;
}

/** Photo picker for the listing form. Uploaded photos are submitted as `photos`. */
export function PhotoUploader({
	initial = [],
	max,
}: {
	initial?: string[];
	max: number;
}) {
	const [photos, setPhotos] = useState<string[]>(initial);
	const [uploading, setUploading] = useState(0);
	const [error, setError] = useState("");

	const add = async (files: FileList | null) => {
		if (!files) return;
		setError("");
		const room = max - photos.length;
		const chosen = [...files].slice(0, Math.max(room, 0));
		if (files.length > chosen.length) {
			setError(`You can add up to ${max} photos.`);
		}
		setUploading((n) => n + chosen.length);
		for (const file of chosen) {
			try {
				const url = await upload(file);
				setPhotos((current) => [...current, url]);
			} catch {
				setError(
					"A photo could not be uploaded. Check your connection and try again.",
				);
			} finally {
				setUploading((n) => n - 1);
			}
		}
	};

	return (
		<div>
			{photos.map((url) => (
				<input key={url} type="hidden" name="photos" value={url} />
			))}
			{(photos.length > 0 || uploading > 0) && (
				<ul className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
					{photos.map((url, index) => (
						<li key={url} className="relative">
							<img
								src={url}
								alt={`Room, upload ${index + 1}`}
								className="aspect-square w-full rounded-lg border border-line object-cover"
							/>
							<button
								type="button"
								onClick={() =>
									setPhotos((p) => p.filter((item) => item !== url))
								}
								aria-label={`Remove photo ${index + 1}`}
								className="absolute right-1 top-1 flex size-7 items-center justify-center rounded-full bg-black/70 text-sm text-white"
							>
								✕
							</button>
						</li>
					))}
					{Array.from({ length: uploading }, (_, index) => (
						<li
							// biome-ignore lint/suspicious/noArrayIndexKey: identical placeholders
							key={`pending-${index}`}
							className="flex aspect-square items-center justify-center rounded-lg border border-dashed border-line text-xs text-muted motion-safe:animate-pulse"
						>
							Uploading
						</li>
					))}
				</ul>
			)}
			{photos.length < max && (
				<label className="btn btn-ghost cursor-pointer text-sm">
					{photos.length === 0 ? "Add photos" : "Add more photos"}
					<input
						type="file"
						accept="image/*"
						multiple
						className="sr-only"
						onChange={(event) => {
							void add(event.target.files);
							event.target.value = "";
						}}
					/>
				</label>
			)}
			<p className="mt-2 text-xs text-muted" aria-live="polite">
				{uploading > 0
					? "Uploading. Wait for it to finish before you submit."
					: `${photos.length} of ${max} photos. They are shrunk before upload to save your data.`}
			</p>
			{error && (
				<p role="alert" className="mt-2 text-sm text-danger">
					{error}
				</p>
			)}
		</div>
	);
}
