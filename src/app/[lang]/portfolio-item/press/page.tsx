import type { Metadata } from "next";
import Image from "next/image";

import { pressPage } from "@/lib/editorial";
import { getDict, isLocale, type Locale } from "@/lib/i18n";
import PageTitle from "@/components/ui/PageTitle";
import { formatThemeDate } from "@/utility/utils";

type Props = {
	params: Promise<{ lang: string }>;
};

async function getLang(params: Props["params"]): Promise<Locale> {
	const { lang } = await params;
	return isLocale(lang) ? lang : "it";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	return {
		title: getDict(await getLang(params)).home.press,
		description: `${pressPage.subject}: ${pressPage.description}`,
		alternates: { canonical: "/portfolio-item/press/" },
	};
}

const labelClassName =
	"mb-[5px] font-cinzel text-xl font-medium leading-[25px] tracking-[-0.02em] text-black";

// Il tipo "portfolio-item" del tema non è esposto dalle API di WordPress:
// la rassegna stampa è statica (contenuti in lib/editorial.ts)
export default async function PressPage({ params }: Props) {
	const t = getDict(await getLang(params));

	return (
		<>
			<PageTitle title={t.home.press} />
			<main className="qodef-content-grid pb-[100px] pt-[97px]">
				<div className="flex flex-col gap-[30px]">
					{pressPage.images.map((img) => (
						<Image
							key={img.url}
							src={img.url}
							alt={`${t.home.press}: ${pressPage.subject}`}
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
							<dt className={labelClassName}>{t.press.date}</dt>
							<dd>{formatThemeDate(pressPage.date, t.dateLocale)}</dd>
						</div>
						<div>
							<dt className={labelClassName}>{t.press.category}</dt>
							<dd>{pressPage.category}</dd>
						</div>
					</dl>
				</div>
			</main>
		</>
	);
}
