import { useLingui } from "@lingui/react";
import { isTheme, themeMap } from "@/utils/theme";
import { Combobox, type ComboboxProps } from "../ui/combobox";
import { useTheme } from "./provider";

type Props = Omit<ComboboxProps, "options" | "value" | "onValueChange">;

export function ThemeCombobox(props: Props) {
	const { i18n } = useLingui();
	const { theme, setTheme } = useTheme();

	const options = Object.entries(themeMap).map(([value, label]) => ({
		value,
		label: i18n.t(label),
		keywords: [i18n.t(label)],
	}));

	const onThemeChange = (value: string | null) => {
		if (!value || !isTheme(value)) return;
		setTheme(value);
	};

	return <Combobox options={options} defaultValue={theme} onValueChange={onThemeChange} {...props} />;
}
