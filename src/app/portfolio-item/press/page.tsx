import type { Metadata } from "next";
import Image from "next/image";

import { pressPage } from "@/lib/editorial";
import PageTitle from "@/components/ui/PageTitle";
import { formatThemeDate } from "@/utility/utils";

export const metadata: Metadata = {
	title: pressPage.title,
};

const labelClassName =
	"mb-[5px] font-cinzel text-xl font-medium leading-[25px] tracking-[-0.02em] text-black";

// Il tipo "portfolio-item" del tema non è esposto dalle API di WordPress:
// la rassegna stampa è statica (contenuti in lib/editorial.ts)
export default function PressPage() {
	return (
		<>
			<PageTitle title={pressPage.title} />
			<main className="qodef-content-grid pb-[100px] pt-[97px]">
				<div className="flex flex-col gap-[30px]">
					{pressPage.images.map((img) => (
						<Image
							key={img.url}
							src={img.url}
							alt={`${pressPage.title}: ${pressPage.subject}`}
							width={img.width}
							height={img.height}
							sizes="(min-width: 1100px) 1100px, 100vw"
							className="h-auto w-full"
						/>
					))}
				</div>
				<div className="mt-[60px] grid grid-cols-1 desk:grid-cols-[9fr_3fr] desk:gap-x-[30px]">
					<div />
					<dl className="space-y-3">
						<div>
							<dt className={labelClassName}>{pressPage.subject}:</dt>
							<dd>{pressPage.description}</dd>
						</div>
						<div>
							<dt className={labelClassName}>Data:</dt>
							<dd>{formatThemeDate(pressPage.date)}</dd>
						</div>
						<div>
							<dt className={labelClassName}>Categoria:</dt>
							<dd>{pressPage.category}</dd>
						</div>
					</dl>
				</div>
			</main>
		</>
	);
}
