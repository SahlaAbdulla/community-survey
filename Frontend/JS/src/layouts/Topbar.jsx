import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useViewport } from "@/hooks/useViewPort";
import { useLayoutContext } from "@/context/useLayoutContext.jsx";
import { toggleDocumentAttribute } from "@/utils";
import { FiLogIn, FiLogOut } from "react-icons/fi";

// ✅ import LoginSidebar Component
import LoginSidebar from "@/components/LoginSidebar";

const Topbar = ({ hideLogo, navCssClasses }) => {
  const navigate = useNavigate();
  const { width } = useViewport();
  const { menu, changeMenuSize, themeCustomizer } = useLayoutContext();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showLoginSidebar, setShowLoginSidebar] = useState(false); // ✅ controls sidebar

  // ✅ On first load → check if logged in
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const user = localStorage.getItem("userDetails");
    setIsLoggedIn(!!token);
    setCurrentUser(user ? JSON.parse(user) : null);
  }, []);

  // ✅ Handle Login / Logout Button click
  const handleAuth = () => {
    if (isLoggedIn) {
      // Logout
      localStorage.removeItem("authToken");
      localStorage.removeItem("userDetails");
      setIsLoggedIn(false);
      setCurrentUser(null);
      navigate("/");
    } else {
      // Login → open sidebar
      setShowLoginSidebar(true);
    }
  };

  const handleLeftMenuCallBack = () => {
    if (width < 1140) {
      if (menu.size === "full") {
        showLeftSideBarBackdrop();
        toggleDocumentAttribute("class", "sidebar-enable");
      } else {
        changeMenuSize("full");
      }
    } else if (menu.size === "condensed") {
      changeMenuSize("default");
    } else if (menu.size === "full") {
      showLeftSideBarBackdrop();
      toggleDocumentAttribute("class", "sidebar-enable");
    } else if (menu.size === "fullscreen") {
      changeMenuSize("default");
      toggleDocumentAttribute("class", "sidebar-enable");
    } else {
      changeMenuSize("condensed");
    }
  };

  function showLeftSideBarBackdrop() {
    const backdrop = document.createElement("div");
    backdrop.id = "custom-backdrop";
    backdrop.className = "offcanvas-backdrop fade show";
    document.body.appendChild(backdrop);
    if (document.getElementsByTagName("html")[0]?.getAttribute("dir") !== "rtl") {
      document.body.style.overflow = "hidden";
      if (width > 1140) {
        document.body.style.paddingRight = "15px";
      }
    }
    backdrop.addEventListener("click", function () {
      toggleDocumentAttribute("class", "sidebar-enable", true);
      changeMenuSize("full");
      hideLeftSideBarBackdrop();
    });
  }

  function hideLeftSideBarBackdrop() {
    const backdrop = document.getElementById("custom-backdrop");
    if (backdrop) {
      document.body.removeChild(backdrop);
      document.body.style.overflow = "visible";
    }
  }

  return (
    <>
      <div className={`navbar-custom ${navCssClasses || ""}`}>
        <div className={`topbar ${!hideLogo ? "container-fluid" : ""}`}>
          <div className="topbar-menu d-flex align-items-center gap-1">
            {!hideLogo && (
              <div className="logo-box">
                <Link to="/" className="logo survey text-center"></Link>
              </div>
            )}

            <button className="button-toggle-menu" onClick={handleLeftMenuCallBack}>
              <i className="mdi mdi-menu" />
            </button>
          </div>

          <ul className="topbar-menu d-flex align-items-center">
            <li>
              <button
                className="nav-link dropdown-toggle right-bar-toggle waves-effect waves-light btn btn-link shadow-none"
                onClick={themeCustomizer.toggle}
              >
                <i className="fe-settings noti-icon font-22"></i>
              </button>
            </li>

            <li>
              <button
                onClick={handleAuth}
                className="btn btn-sm btn-outline-light ms-2 d-flex align-items-center gap-1"
                title={isLoggedIn ? "Logout" : "Login"}
              >
                {isLoggedIn ? <FiLogOut size={18} /> : <FiLogIn size={18} />}
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* ✅ Login Sidebar */}
      <LoginSidebar
        show={showLoginSidebar}
        handleClose={() => setShowLoginSidebar(false)}
        onLoginSuccess={() => {
          setIsLoggedIn(!!localStorage.getItem("authToken"));
          const user = localStorage.getItem("userDetails");
          setCurrentUser(user ? JSON.parse(user) : null);
          setShowLoginSidebar(false); // auto close after login
        }}
        currentUser={currentUser}
      />
    </>
  );
};

export default Topbar;
