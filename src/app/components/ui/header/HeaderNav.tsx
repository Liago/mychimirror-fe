"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import type { MenuItem } from "@/lib/data";

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
	const pathname = usePathname();
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const isCurrent = (uri: string) => pathname === uri;

	return (
		<>
			<header className="relative hidden h-[100px] bg-white desk:block">
				<div className="flex h-full items-center justify-between px-10">
					<Link href="/" rel="home" className="shrink-0">
						<Image
							width={326}
							height={52}
							alt="MyChicMirror"
							src={LOGO_URL}
							priority
						/>
					</Link>
					<nav aria-label="Menu principale" className="h-full">
						<ul className="flex h-full items-center">
							{menuItems.map((item) => (
								<li key={item.uri} className="group h-full">
									<Link
										href={item.uri}
										aria-current={isCurrent(item.uri) ? "page" : undefined}
										className={`${linkClassName} flex h-full items-center whitespace-nowrap`}
									>
										<span className="block border-r border-separator pl-[25px] pr-[22px] leading-6 group-last:border-r-0">
											{item.label}
										</span>
									</Link>
								</li>
							))}
						</ul>
					</nav>
				</div>
			</header>

			<header className="relative z-40 h-[70px] bg-mobile-header desk:hidden">
				<div className="flex h-full items-center justify-between pl-6 pr-[34px]">
					<Link href="/" rel="home" onClick={() => setIsMenuOpen(false)}>
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
						aria-label={isMenuOpen ? "Chiudi menu" : "Apri menu"}
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
						aria-label="Menu principale"
						className="absolute inset-x-0 top-full bg-mobile-menu"
					>
						<ul className="qodef-content-grid py-[34px]">
							{menuItems.map((item) => (
								<li key={item.uri}>
									<Link
										href={item.uri}
										aria-current={isCurrent(item.uri) ? "page" : undefined}
										onClick={() => setIsMenuOpen(false)}
										className={`${linkClassName} block leading-10`}
									>
										{item.label}
									</Link>
								</li>
							))}
						</ul>
					</nav>
				)}
			</header>
		</>
	);
};

export default HeaderNav;
