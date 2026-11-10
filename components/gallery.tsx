import Image from "next/image";

/** Swipeable photo strip. Only the first photo loads eagerly. */
export function Gallery({ photos, name }: { photos: string[]; name: string }) {
	if (photos.length === 0) return null;
	return (
		<ul
			aria-label={`Photos of ${name}`}
			className="mt-3 flex snap-x snap-mandatory gap-2 overflow-x-auto pb-2"
		>
			{photos.map((src, i) => (
				<li key={src} className="shrink-0 snap-start w-4/5 sm:w-1/2">
					<Image
						src={src}
						alt={`${name}, photo ${i + 1} of ${photos.length}`}
						width={640}
						height={480}
						sizes="(min-width: 640px) 320px, 80vw"
						priority={i === 0}
						className="aspect-[4/3] w-full rounded-xl border border-line object-cover"
					/>
				</li>
			))}
		</ul>
	);
}
