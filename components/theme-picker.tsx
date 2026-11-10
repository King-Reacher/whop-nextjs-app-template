import { setTheme } from "@/app/(site)/actions";
import { THEMES, type ThemeId } from "@/lib/theme";

/** Three colour dots. Plain form buttons, so it works without JavaScript. */
export function ThemePicker({ current }: { current: ThemeId }) {
	return (
		<form className="flex items-center gap-2.5">
			{THEMES.map((theme) => (
				<button
					key={theme.id}
					type="submit"
					formAction={setTheme.bind(null, theme.id)}
					aria-label={`${theme.label} theme`}
					aria-pressed={theme.id === current}
					title={theme.label}
					className="swatch"
					style={{ background: theme.swatch }}
				/>
			))}
		</form>
	);
}
