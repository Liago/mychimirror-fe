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
import { openSans } from "../assets/fonts";

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
            className="hidden text-black uppercase text-sm tracking-wider md:block"
            href={item.path}
          >
            {item.label}
          </Link>
        </NavbarItem>
      );
    });
  };

  const renderBurgerMenu = () => {
    return menuItems.map((item, index) => (
      <NavbarMenuItem key={`${item}-${index}`} className={openSans.className}>
        <Link
          className="w-full text-black uppercase text-sm tracking-wider sm:hidden"
          href="#"
          size="lg"
        >
          {item.label}
        </Link>
      </NavbarMenuItem>
    ));
  };

  return (
    <Navbar onMenuOpenChange={setIsMenuOpen}>
      <NavbarContent>
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
      <NavbarContent justify="end">{renderMainMenu()}</NavbarContent>
      <NavbarMenu>{renderBurgerMenu()}</NavbarMenu>
    </Navbar>
  );
};
export default Header;
