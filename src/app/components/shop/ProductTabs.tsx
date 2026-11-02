"use client";

import { useState } from "react";

type Tab = {
	id: string;
	label: string;
	content: React.ReactNode;
};

type Props = {
	tabs: Tab[];
};

/**
 * Schede sotto il prodotto come nel tema: voci separate da una linea verticale,
 * scheda attiva in oro, linea grigia sotto.
 */
const ProductTabs = ({ tabs }: Props) => {
	const [active, setActive] = useState(tabs[0]?.id);
	if (!tabs.length) return null;
	const current = tabs.find((t) => t.id === active) ?? tabs[0];

	return (
		<div className="mt-[119px]">
			<div
				role="tablist"
				className="flex flex-wrap gap-y-3 border-b border-separator pb-[11px]"
			>
				{tabs.map((tab, i) => (
					<button
						key={tab.id}
						type="button"
						role="tab"
						id={`tab-${tab.id}`}
						aria-selected={tab.id === current.id}
						aria-controls={`panel-${tab.id}`}
						onClick={() => setActive(tab.id)}
						className={`font-open-sans text-[11px] font-medium uppercase leading-[22px] tracking-[0.3em] text-black transition-colors hover:text-fake-black aria-selected:text-fake-black ${
							i > 0 ? "pl-7" : ""
						} ${i < tabs.length - 1 ? "border-r border-separator pr-6" : ""}`}
					>
						{tab.label}
					</button>
				))}
			</div>
			<div
				role="tabpanel"
				id={`panel-${current.id}`}
				aria-labelledby={`tab-${current.id}`}
				className="pt-[13px]"
			>
				{current.content}
			</div>
		</div>
	);
};

export default ProductTabs;
