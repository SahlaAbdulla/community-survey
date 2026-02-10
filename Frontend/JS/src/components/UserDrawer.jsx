import React from "react";


const UserDrawer = ({ open, onClose }) => {
  return (
    <div className={`drawer ${open ? "open" : ""}`}>
      <div className="drawer-header">
        <h4>User Panel</h4>
        <button onClick={onClose}>✖</button>
      </div>

      <div className="drawer-content">
        <p>Login / Logout button clicked</p>
      </div>
    </div>
  );
};

export default UserDrawer;
