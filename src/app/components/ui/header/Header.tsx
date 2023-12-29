"use client";
import { useState } from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
  Image,
} from "@nextui-org/react";

import { openSans } from "@/assets/fonts";
import "./Header.scss";

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
        <NavbarItem key={`${item}-${index}`} className={openSans.className}>
          <Link
            className="hidden text-fake-black font-semibold uppercase text-xs tracking-widest md:block"
            href={item.path}
          >
            {item.label}
            <span rel="menu-border"></span>
          </Link>
        </NavbarItem>
      );
    });
  };

  const renderBurgerMenu = () => {
    return menuItems.map((item, index) => (
      <NavbarMenuItem key={`${item}-${index}`} className={openSans.className}>
        <Link
          className="w-full text-fake-black font-semibold uppercase text-xs tracking-widest sm:hidden"
          href="#"
          size="lg"
        >
          {item.label}
        </Link>
      </NavbarMenuItem>
    ));
  };

  return (
    <Navbar
      onMenuOpenChange={setIsMenuOpen}
      height="100px"
      maxWidth="full"
      isBordered={true}
    >
      <NavbarContent className="w-full">
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden"
        />
        <NavbarBrand>
          <Image
            width={300}
            alt="MyChicMirror Logo"
            src="https://www.mychicmirror.com/wp-content/uploads/MCM-TITLE_thin_whit_strawberries.png"
          />
        </NavbarBrand>
      </NavbarContent>
      <NavbarContent rel="main-menu">{renderMainMenu()}</NavbarContent>
      <NavbarMenu>{renderBurgerMenu()}</NavbarMenu>
    </Navbar>
  );
};
export default Header;
