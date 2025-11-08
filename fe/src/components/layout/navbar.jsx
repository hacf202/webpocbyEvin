// components/layout/Navbar.jsx
import React from "react";
import DesktopNavbar from "./DesktopNavbar";
import MobileSidebar from "./MobileSidebar";

function Navbar() {
	return (
		<>
			<DesktopNavbar />
			<MobileSidebar />
		</>
	);
}

export default Navbar;
