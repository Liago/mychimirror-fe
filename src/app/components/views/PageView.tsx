import type { Page } from "@/lib/content";
import PageTitle from "@/components/ui/PageTitle";
import WPContent from "@/components/ui/WPContent";

type Props = {
	page: Page;
};

/**
 * Pagina WordPress generica: fascia titolo + contenuto Gutenberg.
 */
export default function PageView({ page }: Props) {
	return (
		<>
			<PageTitle title={page.title} />
			<main className="qodef-content-grid pb-[100px] pt-[97px]">
				<WPContent html={page.content} />
			</main>
		</>
	);
}
