"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useI18n } from "@/components/i18n/I18nProvider";
import type { MenuItem } from "@/lib/data";
import { stripLocale } from "@/lib/i18n";
import LanguageSwitcher from "./LanguageSwitcher";

const LOGO_URL =
	"https://www.mychicmirror.com/wp-content/uploads/MCM-TITLE_thin_whit_strawberries.png";
const MOBILE_LOGO_URL =
	"https://www.mychicmirror.com/wp-content/uploads/MCM-TITLE_thin_whit_strawberries_Lug2020.png";

// Larghezza e posizione delle 4 linee dell'icona hamburger del tema
const OPENER_LINES = [
	{ top: 0, width: 26 },
	{ top: 8, width: 19 },
	{ top: 16, width: 19 },
	{ top: 24, width: 26 },
];

const linkClassName =
	"font-open-sans text-xs font-semibold uppercase tracking-widest text-black transition-colors hover:text-fake-black aria-[current=page]:text-fake-black";

type Props = {
	menuItems: MenuItem[];
};

const HeaderNav = ({ menuItems }: Props) => {
	const { t, href } = useI18n();
	const pathname = stripLocale(usePathname());
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const isCurrent = (uri: string) => pathname === uri;

	return (
		<>
			<header className="sticky top-0 z-40 hidden h-[100px] bg-white shadow-[0_1px_0_0_rgba(0,0,0,0.06)] desk:block">
				<div className="flex h-full items-center justify-between px-10">
					<Link href={href("/")} rel="home" className="shrink-0">
						<Image
							width={326}
							height={52}
							alt="MyChicMirror"
							src={LOGO_URL}
							priority
						/>
					</Link>
					<nav aria-label={t.nav.mainMenu} className="flex h-full items-center">
						<ul className="flex h-full items-center">
							{menuItems.map((item) => (
								<li key={item.uri} className="group h-full">
									<Link
										href={href(item.uri)}
										aria-current={isCurrent(item.uri) ? "page" : undefined}
										className={`${linkClassName} flex h-full items-center whitespace-nowrap`}
									>
										<span className="block border-r border-separator pl-[25px] pr-[22px] leading-6 group-last:border-r-0">
											{t.nav.labels[item.uri] ?? item.label}
										</span>
									</Link>
								</li>
							))}
						</ul>
						<LanguageSwitcher className="ml-6 border-l border-separator pl-6" />
					</nav>
				</div>
			</header>

			<header className="sticky top-0 z-40 h-[70px] bg-mobile-header desk:hidden">
				<div className="flex h-full items-center justify-between pl-6 pr-[34px]">
					<Link href={href("/")} rel="home" onClick={() => setIsMenuOpen(false)}>
						<Image
							width={262}
							height={42}
							alt="MyChicMirror"
							src={MOBILE_LOGO_URL}
							priority
						/>
					</Link>
					<button
						type="button"
						aria-label={isMenuOpen ? t.nav.closeMenu : t.nav.openMenu}
						aria-expanded={isMenuOpen}
						aria-controls="mobile-menu"
						onClick={() => setIsMenuOpen((v) => !v)}
						className="relative h-[25px] w-[26px] shrink-0"
					>
						{OPENER_LINES.map((line, i) => (
							<span
								key={i}
								className="absolute right-0 h-px bg-black"
								style={{ top: line.top, width: line.width }}
							/>
						))}
					</button>
				</div>
				{isMenuOpen && (
					<nav
						id="mobile-menu"
						aria-label={t.nav.mainMenu}
						className="absolute inset-x-0 top-full max-h-[calc(100dvh-70px)] overflow-y-auto bg-mobile-menu"
					>
						<ul className="qodef-content-grid py-[34px]">
							{menuItems.map((item) => (
								<li key={item.uri}>
									<Link
										href={href(item.uri)}
										aria-current={isCurrent(item.uri) ? "page" : undefined}
										onClick={() => setIsMenuOpen(false)}
										className={`${linkClassName} block leading-10`}
									>
										{t.nav.labels[item.uri] ?? item.label}
									</Link>
								</li>
							))}
							<li className="mt-4 border-t border-separator pt-5">
								<LanguageSwitcher />
							</li>
						</ul>
					</nav>
				)}
			</header>
		</>
	);
};

export default HeaderNav;
