"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { openSans } from "@/assets/fonts";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    {
      label: "Home",
      path: "/",
    },
    {
      label: "Pillole Emotive",
      path: "/pillole-emotive",
    },
    {
      label: "Shop",
      path: "/shop",
    },
    {
      label: "About",
      path: "/about",
    },
    {
      label: "Contatti",
      path: "/contatti",
    },
  ];

  const renderMainMenu = () => {
    return menuItems.map((item, index) => {
      return (
        <li key={`${item.path}-${index}`} className={openSans.className}>
          <Link
            className="hidden whitespace-nowrap text-fake-black font-semibold uppercase text-xs tracking-widest transition-opacity hover:opacity-80 md:block"
            href={item.path}
          >
            <span
              className={`px-[22px] pl-[25px] leading-loose ${
                index < menuItems.length - 1 ? "border-r border-[#9e9e9e]" : ""
              }`}
            >
              {item.label}
            </span>
          </Link>
        </li>
      );
    });
  };

  const renderBurgerMenu = () => {
    return menuItems.map((item, index) => (
      <li key={`${item.path}-${index}`} className={openSans.className}>
        <Link
          className="block w-full py-2 text-fake-black font-semibold uppercase text-xs tracking-widest"
          href={item.path}
          onClick={() => setIsMenuOpen(false)}
        >
          {item.label}
        </Link>
      </li>
    ));
  };

  return (
    <>
    <nav className="sticky inset-x-0 top-0 z-40 flex h-[100px] w-full items-center justify-center border-b border-divider bg-white/70 backdrop-blur-lg backdrop-saturate-150">
      <header className="relative flex h-full w-full max-w-full flex-row flex-nowrap items-center justify-between gap-4 px-6">
        <div className="flex h-full w-full flex-row flex-nowrap items-center gap-4">
          <button
            type="button"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((v) => !v)}
            className="flex h-6 w-6 flex-col items-center justify-center gap-1.5 md:hidden"
          >
            <span
              className={`block h-px w-6 bg-current transition-transform ${
                isMenuOpen ? "translate-y-[3.5px] rotate-45" : ""
              }`}
            />
            <span
              className={`block h-px w-6 bg-current transition-transform ${
                isMenuOpen ? "-translate-y-[3.5px] -rotate-45" : ""
              }`}
            />
          </button>
          <Link href="/" className="flex flex-grow basis-0 items-center">
            <Image
              width={300}
              height={48}
              alt="MyChicMirror Logo"
              src="https://www.mychicmirror.com/wp-content/uploads/MCM-TITLE_thin_whit_strawberries.png"
              priority
            />
          </Link>
        </div>
        <ul className="flex h-full flex-row flex-nowrap items-center justify-end">
          {renderMainMenu()}
        </ul>
      </header>
    </nav>
    {/* Fuori dal <nav>: il backdrop-filter farebbe da contenitore al position: fixed */}
    {isMenuOpen && (
      <ul className="fixed inset-x-0 bottom-0 top-[100px] z-30 flex flex-col gap-2 overflow-y-auto bg-white/90 px-6 pt-2 backdrop-blur-xl backdrop-saturate-150 md:hidden">
        {renderBurgerMenu()}
      </ul>
    )}
    </>
  );
};
export default Header;
