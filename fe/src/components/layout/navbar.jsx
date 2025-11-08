// components/layout/Navbar.jsx
import React from "react";
import DesktopNavbar from "./desktopNavbarView";
import MobileSidebar from "./mobileNavbarView";

function Navbar() {
	return (
		<>
			<DesktopNavbar />
			<MobileSidebar />
		</>
	);
}

export default Navbar;
