"use client";

/** Submit button that asks "are you sure?" first, for actions with no undo. */
export function ConfirmButton({
	message,
	className,
	children,
}: {
	message: string;
	className?: string;
	children: React.ReactNode;
}) {
	return (
		<button
			type="submit"
			className={className}
			onClick={(event) => {
				if (!window.confirm(message)) event.preventDefault();
			}}
		>
			{children}
		</button>
	);
}
