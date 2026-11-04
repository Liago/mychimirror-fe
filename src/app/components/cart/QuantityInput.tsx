"use client";

import { useI18n } from "@/components/i18n/I18nProvider";

type Props = {
	value: number;
	max: number;
	onChange: (value: number) => void;
	disabled?: boolean;
	/** "md": campo 44px del tema (pagina prodotto); "sm": righe del carrello */
	size?: "md" | "sm";
	tone?: "light" | "dark";
	label: string;
};

/**
 * Selettore quantità con − e + come nel tema.
 */
const QuantityInput = ({
	value,
	max,
	onChange,
	disabled = false,
	size = "md",
	tone = "dark",
	label,
}: Props) => {
	const { t } = useI18n();
	const isSmall = size === "sm";
	const color =
		tone === "light" ? "text-white border-white/60" : "text-black border-separator";
	const set = (n: number) => onChange(Math.min(max, Math.max(1, n)));

	return (
		<div className={`flex items-center ${isSmall ? "gap-2" : "gap-3"}`}>
			<button
				type="button"
				onClick={() => set(value - 1)}
				disabled={disabled || value <= 1}
				aria-label={t.shop.decrease}
				className={`font-cinzel leading-none disabled:opacity-40 ${
					tone === "light" ? "text-white" : "text-black"
				} ${isSmall ? "text-lg" : "text-2xl"}`}
			>
				−
			</button>
			<input
				type="number"
				min={1}
				max={max}
				value={value}
				disabled={disabled}
				aria-label={label}
				onChange={(e) => set(Number(e.target.value) || 1)}
				className={`appearance-none border bg-transparent text-center font-cinzel [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${color} ${
					isSmall ? "h-8 w-10 text-base" : "h-11 w-11 text-2xl"
				}`}
			/>
			<button
				type="button"
				onClick={() => set(value + 1)}
				disabled={disabled || value >= max}
				aria-label={t.shop.increase}
				className={`font-cinzel leading-none disabled:opacity-40 ${
					tone === "light" ? "text-white" : "text-black"
				} ${isSmall ? "text-lg" : "text-2xl"}`}
			>
				+
			</button>
		</div>
	);
};

export default QuantityInput;
