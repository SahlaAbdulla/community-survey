import React, { useState, useEffect } from "react";
import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const UserRegistrationForm = ({ existingUser, onSuccess }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    mobile: "",
    password: "",
    userType: "",
    department: "",
  });

  // ✅ Success / Error message state
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });

  const userTypes = ["Super Admin", "Dept Admin", "User"];
  const departments = ["Election", "Mahallu", "Education", "Madrasa", "Health"];

  // ✅ Prefill data if editing
  useEffect(() => {
    if (existingUser) {
      setFormData({
        username: existingUser.username || "",
        email: existingUser.email || "",
        mobile: existingUser.phone_no || "",
        password: "", // password not shown
        userType: existingUser.user_type || "",
        department: existingUser.department || "",
      });
    } else {
      setFormData({
        username: "",
        email: "",
        mobile: "",
        password: "",
        userType: "",
        department: "",
      });
    }
    // clear old message when modal opens
    setStatusMessage({ type: "", text: "" });
  }, [existingUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

 const handleSubmit = (e) => {
  e.preventDefault();

  const payload = {
    username: formData.username,
    email: formData.email,
    phone_no: formData.mobile,
    user_type: formData.userType,
    department: formData.userType === "Dept Admin" ? formData.department : null,
  };

  if (!existingUser || formData.password.trim() !== "") {
    payload.password = formData.password;
  }

  // ✅ Add this line below
  console.log("🚀 Sending payload:", payload);

  if (existingUser) {
    // 🔄 Update existing user
    axios
      .put(`${API_BASE_URL}/api/users/${existingUser.id}/`, payload)
        .then(() => {
          setStatusMessage({ type: "success", text: "✅ User updated successfully!" });
          if (onSuccess) onSuccess();
        })
        .catch((err) => {
          console.error("Update failed:", err.response?.data || err);
          setStatusMessage({ type: "error", text: "❌ Update failed. Please try again." });
        });
    } else {
      // ➕ Register new user
      axios
        .post(`${API_BASE_URL}/api/users/`, payload)
        .then(() => {
          setStatusMessage({ type: "success", text: "✅ User registered successfully!" });
          if (onSuccess) onSuccess();
        })
        .catch((err) => {
          console.error("Registration failed:", err.response?.data || err);
          setStatusMessage({ type: "error", text: "❌ Registration failed. Please try again." });
        });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="row g-3">
      <div className="col-md-6">
        <label className="form-label">Name</label>
        <input
          type="text"
          name="username"
          className="form-control"
          value={formData.username}
          onChange={handleChange}
          required
        />
      </div>

      <div className="col-md-6">
        <label className="form-label">Email</label>
        <input
          type="email"
          name="email"
          className="form-control"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      <div className="col-md-6">
        <label className="form-label">Mobile</label>
        <input
          type="text"
          name="mobile"
          className="form-control"
          value={formData.mobile}
          onChange={handleChange}
          required
        />
      </div>

      <div className="col-md-6">
  <label className="form-label">
    {existingUser ? "New Password (leave blank to keep old)" : "Password"}
  </label>
  <input
    type="password"
    name="password"
    className="form-control"
    value={formData.password}
    onChange={handleChange}
    required={!existingUser}  // 👈 Required for new user, optional for edit
  />
</div>
      <div className="col-md-6">
        <label className="form-label">User Type</label>
        <select
          name="userType"
          className="form-select"
          value={formData.userType}
          onChange={handleChange}
          required
        >
          <option value="">Select User Type</option>
          {userTypes.map((t, i) => (
            <option key={i} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {formData.userType === "Dept Admin" && (
        <div className="col-md-6">
          <label className="form-label">Department</label>
          <select
            name="department"
            className="form-select"
            value={formData.department}
            onChange={handleChange}
          >
            <option value="">Select Department</option>
            {departments.map((d, i) => (
              <option key={i} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* ✅ Inline success/error message */}
      {statusMessage.text && (
        <div
          className={`alert ${
            statusMessage.type === "success" ? "alert-success" : "alert-danger"
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      <div className="col-12 text-end">
        <button type="submit" className="btn btn-primary">
          {existingUser ? "Update User" : "Register"}
        </button>
      </div>
    </form>
  );
};

export default UserRegistrationForm;
