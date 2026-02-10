import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap-icons/font/bootstrap-icons.css";
import UserRegistrationForm from "./UserRegistrationForm";
import { toast } from "react-toastify"; // ✅ Import toast

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const UserManagement = () => {
  const [showModal, setShowModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [editUser, setEditUser] = useState(null);

  // 🔹 Fetch all users
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/users/`);
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
      toast.error("❌ Failed to fetch users!");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 🔹 Edit handler
  const handleEdit = (user) => {
    setEditUser(user);
    setShowModal(true);
  };

  // 🔹 Delete confirmation
  const confirmDelete = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  // 🔹 Handle delete action
  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/users/${userToDelete.id}/`);
      setUsers(users.filter((u) => u.id !== userToDelete.id));
      setShowDeleteModal(false);
      setUserToDelete(null);
      toast.success("🗑️ User deleted successfully!");
    } catch (err) {
      console.error("Error deleting user:", err);
      toast.error("❌ Failed to delete user!");
    }
  };

  return (
    <>
      <div className="page-title-box d-flex justify-content-between align-items-center">
        <h4 className="page-title">User List</h4>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Add User
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone No</th>
                <th>User Type</th>
                <th>Department</th>
                <th>Password</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.length > 0 ? (
                users.map((u, index) => (
                  <tr key={u.id}>
                    <td>{index + 1}</td>
                    <td>{u.username || "—"}</td>
                    <td>{u.email || "—"}</td>
                    <td>{u.phone_no || "—"}</td>
                    <td>{u.user_type || "—"}</td>
                    <td>{u.department || "—"}</td>
                    <td>******</td>
                    <td className="text-center">
                      <i
                        className="bi bi-pencil-square text-primary me-3"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleEdit(u)}
                      ></i>
                      <i
                        className="bi bi-trash text-danger"
                        style={{ cursor: "pointer" }}
                        onClick={() => confirmDelete(u)}
                      ></i>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ✅ Add/Edit User Modal */}
      {showModal && (
        <div className="modal show d-block">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editUser ? "Edit User" : "Register New User"}
                </h5>
                <button
                  className="btn-close"
                  onClick={() => {
                    setShowModal(false);
                    setEditUser(null);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <UserRegistrationForm
                  existingUser={editUser}
                  onSuccess={() => {
                    setShowModal(false);
                    fetchUsers();
                    toast.success(
                      editUser
                        ? "✅ User updated successfully!"
                        : "✅ User added successfully!"
                    );
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDeleteModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                Are you sure you want to delete{" "}
                <b>{userToDelete?.username}</b>?
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={handleDelete}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserManagement;
