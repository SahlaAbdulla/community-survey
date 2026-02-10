import React, { useEffect, useState } from "react";
import { Offcanvas, Modal, Button, Card, Badge, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const LoginSidebar = ({ show, handleClose, onLoginSuccess }) => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [currentUser, setCurrentUser] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) setCurrentUser(JSON.parse(user));
  }, [show]);

  const onSubmit = async (data) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/login/`,
        data
      );

      localStorage.setItem("access_token", res.data.access);
      localStorage.setItem("refresh_token", res.data.refresh);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      setCurrentUser(res.data.user);
      onLoginSuccess();
      handleClose();
    } catch {
      alert("❌ Login Failed");
    }
  };

  const handleLogout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");

  setCurrentUser(null);
  setShowConfirm(false);
  onLoginSuccess();
  handleClose();

  // ✅ LOGOUT: redirect to login page shown in screenshot
  navigate("/auth/login?next=/");
};
  return (
    <>
      {/* ✅ Logout Confirmation - SMALL modal using Bootstrap */}
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered size="sm">
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">Confirm Logout</Modal.Title>
        </Modal.Header>

        <Modal.Body className="text-center fs-6 fw-semibold">
          Are you sure you want to logout?
        </Modal.Body>

        <Modal.Footer className="justify-content-between">
          <Button variant="secondary" onClick={() => setShowConfirm(false)}>
            Cancel
          </Button>

          <Button variant="danger" onClick={handleLogout}>
            Logout
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ✅ Fixed width Offcanvas — NO CSS file required */}
      <Offcanvas
        placement="end"
        show={show}
        onHide={handleClose}
        style={{ width: "280px" }}   // 👈 width controlled here (2nd screenshot size)
      >
        <Offcanvas.Header closeButton className="shadow-sm py-3 px-4">
          <Offcanvas.Title className="fw-bold fs-4 text-primary">
            {currentUser ? "👤 Profile" : "🔐 Login"}
          </Offcanvas.Title>
        </Offcanvas.Header>

        <Offcanvas.Body className="p-4">

          {currentUser ? (
            /* ✅ Profile Card */
            <Card className="border-0 shadow-lg p-4 rounded-4 text-center">
              <div
                className="rounded-circle d-flex justify-content-center align-items-center text-white shadow"
                style={{
                  width: 95,
                  height: 95,
                  margin: "auto",
                  background: "linear-gradient(135deg, #4e73df, #224abe)",
                  fontSize: "2rem",
                }}
              >
                {currentUser.username.charAt(0).toUpperCase()}
              </div>

              <h4 className="mt-3 fw-bold">{currentUser.username}</h4>
              <p className="text-muted">{currentUser.email}</p>

              <Badge bg="primary" className="px-3 py-2">
                {currentUser.user_type}
              </Badge>

              {currentUser.department && (
                <p className="mt-2 text-secondary small">
                  Dept: <strong>{currentUser.department}</strong>
                </p>
              )}

              <Button
                variant="danger"
                className="mt-4 w-100 fw-semibold py-2 rounded-pill"
                onClick={() => setShowConfirm(true)}
              >
                Logout
              </Button>
            </Card>
          ) : (
            /* ✅ Login Form */
            <Card className="p-4 border-0 shadow rounded-4">
              <h4 className="fw-bold text-center mb-3">Welcome Back</h4>

              <Form onSubmit={handleSubmit(onSubmit)}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Username</Form.Label>
                  <Form.Control type="text" {...register("username", { required: true })} />
                  {errors.username && <small className="text-danger">Required</small>}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Password</Form.Label>
                  <Form.Control type="password" {...register("password", { required: true })} />
                  {errors.password && <small className="text-danger">Required</small>}
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">User Type</Form.Label>
                  <Form.Select {...register("user_type", { required: true })}>
                    <option value="">Select</option>
                    <option value="Super Admin">Super Admin</option>
                    <option value="Dept Admin">Dept Admin</option>
                    <option value="User">User</option>
                  </Form.Select>
                </Form.Group>

                <Button type="submit" className="w-100 fw-semibold py-2 rounded-pill" variant="primary">
                  Login
                </Button>
              </Form>
            </Card>
          )}
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default LoginSidebar;
