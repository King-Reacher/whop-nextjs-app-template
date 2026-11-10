import type { SVGProps } from "react";

function Icon({ children, ...props }: SVGProps<SVGSVGElement>) {
	return (
		<svg
			viewBox="0 0 24 24"
			width="20"
			height="20"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.7"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			{...props}
		>
			{children}
		</svg>
	);
}

type Props = SVGProps<SVGSVGElement>;

export const RoomsIcon = (p: Props) => (
	<Icon {...p}>
		<path d="M4 21V9l8-6 8 6v12" />
		<path d="M9.5 21v-6h5v6" />
	</Icon>
);

export const ChartIcon = (p: Props) => (
	<Icon {...p}>
		<path d="M5 20V11M12 20V4M19 20v-6" />
	</Icon>
);

export const HeartIcon = (p: Props) => (
	<Icon {...p}>
		<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />
	</Icon>
);

export const PlayIcon = (p: Props) => (
	<Icon {...p}>
		<path d="M8 5.5v13l11-6.5-11-6.5Z" fill="currentColor" />
	</Icon>
);

export const LockIcon = (p: Props) => (
	<Icon {...p}>
		<rect x="5" y="10.5" width="14" height="10" rx="2.5" />
		<path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
	</Icon>
);

export const ShieldIcon = (p: Props) => (
	<Icon {...p}>
		<path d="M12 3 5 6v5.5c0 4.3 2.9 7.6 7 9.5 4.1-1.9 7-5.2 7-9.5V6l-7-3Z" />
		<path d="m9 12 2.2 2.2L15 10.4" />
	</Icon>
);

export const CheckIcon = (p: Props) => (
	<Icon {...p}>
		<path d="m5 12.5 4.5 4.5L19 7.5" />
	</Icon>
);

export const PinIcon = (p: Props) => (
	<Icon {...p}>
		<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" />
		<circle cx="12" cy="10" r="2.3" />
	</Icon>
);

export const WalkIcon = (p: Props) => (
	<Icon {...p}>
		<circle cx="13" cy="4.5" r="1.6" />
		<path d="m9 21 2.2-6.2L9 12.5l1-4.5 3-1 2.5 3.5L18 12M11 14.8l3 2.2 1 4" />
	</Icon>
);

export const ArrowLeftIcon = (p: Props) => (
	<Icon {...p}>
		<path d="M19 12H5M11 6l-6 6 6 6" />
	</Icon>
);
