import React, { useEffect, useRef, useState } from "react";
import { Dropdown } from "react-bootstrap";
import { Link } from "react-router-dom";
import SimpleBar from "simplebar-react";
import { getMenuItems } from "@/helpers/menu";

// components
import AppMenu from "./Menu";
import profileImg from "@/assets/images/users/user-1.jpg";
import logoDark from "@/assets/images/survey.png";
import logoDark2 from "@/assets/images/survey.png";
import logoLight from "@/assets/images/survey.png";
import logoLight2 from "@/assets/images/survey.png";
import { FiUser, FiSettings, FiLock, FiLogOut } from "react-icons/fi";
import { useLayoutContext } from "@/context/useLayoutContext.jsx";

/* user box */
const UserBox = () => {
  const ProfileMenus = [
    { label: "My Account", icon: FiUser, redirectTo: "#" },
    { label: "Settings", icon: FiSettings, redirectTo: "#" },
    { label: "Lock Screen", icon: FiLock, redirectTo: "/auth/lock-screen" },
    { label: "Logout", icon: FiLogOut, redirectTo: "/auth/logout" },
  ];

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  // get user from localStorage
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="user-box text-center">
      <img
        src={profileImg}
        alt=""
        title={user?.username || "User"}
        className="rounded-circle avatar-md"
      />
      <Dropdown show={dropdownOpen} onToggle={toggleDropdown}>
        <Dropdown.Toggle
          id="dropdown-notification"
          as="a"
          onClick={toggleDropdown}
          className="cursor-pointer text-dark h5 mt-2 mb-1 d-block"
        >
          {user?.username || "Unknown User"}
        </Dropdown.Toggle>
        <Dropdown.Menu className="user-pro-dropdown">
          <div onClick={toggleDropdown}>
            {(ProfileMenus || []).map((item, index) => (
              <Link
                to={item.redirectTo}
                className="dropdown-item notify-item"
                key={index + "-profile-menu"}
              >
                <item.icon className="me-1" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </Dropdown.Menu>
      </Dropdown>
      <p className="text-muted">{user?.user_type || "User"}</p>
    </div>
  );
};

/* sidebar content */
const SideBarContent = () => {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  if (user && !user.user_type) {
    user.user_type = "User"; // fallback
  }

  console.log(user); // null if not found

  // get full menu list
  let menuItems = getMenuItems();

  // filter: only Super Admin sees "User Management"
  if (user?.user_type?.toLowerCase() !== "super admin") {
    menuItems = menuItems.filter((item) => item.key !== "apps-file-manager");
  }

  return (
    <>
      <UserBox />
      <AppMenu menuItems={menuItems} />
      <div className="clearfix" />
    </>
  );
};

const LeftSidebar = ({ isCondensed, hideLogo }) => {
  const menuNodeRef = useRef(null);
  const { orientation } = useLayoutContext();

  const handleOtherClick = (e) => {
    if (menuNodeRef && menuNodeRef.current && menuNodeRef.current.contains(e.target))
      return;
    if (document.body) {
      document.body.classList.remove("sidebar-enable");
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOtherClick, false);
    return () => {
      document.removeEventListener("mousedown", handleOtherClick, false);
    };
  }, []);

  return (
    <React.Fragment>
      <div className="app-menu" ref={menuNodeRef}>
        {!hideLogo && (
          <div className="logo-box">
            <Link to="/" className="logo survey text-center">
              <span className="logo-lg">
                <img
                  src={orientation === "two-column" ? logoDark2 : logoDark}
                  alt=""
                  height="65"
                />
              </span>
            </Link>
          </div>
        )}

        {!isCondensed && (
          <SimpleBar className="scrollbar show h-100" scrollbarMaxSize={320}>
            <SideBarContent />
          </SimpleBar>
        )}
        {isCondensed && <SideBarContent />}
      </div>
    </React.Fragment>
  );
};

LeftSidebar.defaultProps = {
  isCondensed: false,
};

export default LeftSidebar;
