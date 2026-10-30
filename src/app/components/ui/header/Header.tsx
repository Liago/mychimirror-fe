import { fetchMainMenu } from "@/lib/data";

import HeaderNav from "./HeaderNav";

const Header = async () => {
	const menuItems = await fetchMainMenu();

	return <HeaderNav menuItems={menuItems} />;
};

export default Header;
