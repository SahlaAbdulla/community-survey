import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Table,
  Modal,
  FormControl,
  InputGroup,
} from "react-bootstrap";
import PageTitle from "../../../../components/PageTitle";
import FamilyForm from "./FamilyForm";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faEdit } from "@fortawesome/free-solid-svg-icons";
import api from "../../../../api/axios";
import { toast } from "react-toastify";

const FamilyList = () => {
  const [families, setFamilies] = useState([]);
  const [search, setSearch] = useState("");

  // 📄 Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Modals
  const [showForm, setShowForm] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // 🔥 Fetch families
  const fetchFamilies = async () => {
    try {
      const res = await api.get("families/");
      setFamilies(res.data);
    } catch (err) {
      console.error("Error fetching families:", err);
    }
  };

  useEffect(() => {
    fetchFamilies();
  }, []);

  // ✅ Filter (EN + ML)
  const filteredFamilies = families.filter(
    (f) =>
      f.family_name_en?.toLowerCase().includes(search.toLowerCase()) ||
      f.family_name_ml?.toLowerCase().includes(search.toLowerCase())
  );

  // 📄 Pagination logic
  const totalPages = Math.ceil(filteredFamilies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentFamilies = filteredFamilies.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // ⭐ Smart page numbers
  const getPageNumbers = () => {
    const pages = [];
    const delta = 2;

    const start = Math.max(2, currentPage - delta);
    const end = Math.min(totalPages - 1, currentPage + delta);

    pages.push(1);

    if (start > 2) pages.push("...");

    for (let i = start; i <= end; i++) pages.push(i);

    if (end < totalPages - 1) pages.push("...");

    if (totalPages > 1) pages.push(totalPages);

    return pages;
  };

  const handleAdd = () => {
    setSelectedFamily(null);
    setShowForm(true);
  };

  const handleEdit = (family) => {
    setSelectedFamily(family);
    setShowForm(true);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleSave = async (data) => {
    try {
      if (selectedFamily) {
        await api.put(`families/${selectedFamily.id}/`, data);
        toast.success("✅ Family updated successfully!");
      } else {
        await api.post("families/", data);
        toast.success("✅ Family added successfully!");
      }
      fetchFamilies();
      setShowForm(false);
    } catch {
      toast.error("❌ Failed to save family!");
    }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`families/${deleteId}/`);
      toast.success("🗑️ Family deleted successfully!");
      fetchFamilies();
      setShowDeleteModal(false);
      setDeleteId(null);
    } catch {
      toast.error("❌ Failed to delete family!");
    }
  };

  return (
    <>
      <PageTitle title="Family List" />

      <Row>
        <Col>
          <Card>
            <Card.Body>
              {/* 🔍 Header */}
              <div className="d-flex justify-content-between mb-3 flex-wrap gap-2">
                <InputGroup style={{ width: "250px" }}>
                  <FormControl
                    placeholder="🔍 Search family (EN / ML)..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setCurrentPage(1); // 🔥 reset page
                    }}
                  />
                </InputGroup>

                <Button size="sm" onClick={handleAdd}>
                  + Add Family
                </Button>
              </div>

              {/* 🧾 Table */}
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Family Name (EN)</th>
                    <th>Family Name (ML)</th>
                    <th>House No</th>
                    <th>Sub</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentFamilies.length ? (
                    currentFamilies.map((family, idx) => (
                      <tr key={family.id}>
                        <td>{startIndex + idx + 1}</td>
                        <td>{family.family_name_en}</td>
                        <td>{family.family_name_ml}</td>
                        <td>{family.h_no}</td>
                        <td>{family.sub}</td>
                        <td>
                          <Button
                            size="sm"
                            variant="warning"
                            className="me-2"
                            onClick={() => handleEdit(family)}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDeleteClick(family.id)}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center">
                        No families found
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>

              {/* 📄 Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center gap-2 flex-wrap">
                  <Button
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    Prev
                  </Button>

                  {getPageNumbers().map((p, i) =>
                    p === "..." ? (
                      <span key={i} className="px-2">
                        ...
                      </span>
                    ) : (
                      <Button
                        key={i}
                        size="sm"
                        variant={p === currentPage ? "primary" : "outline-primary"}
                        onClick={() => setCurrentPage(p)}
                      >
                        {p}
                      </Button>
                    )
                  )}

                  <Button
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* 🗑️ Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this family?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      {/* 🧩 Family Form */}
      <FamilyForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        isEditable={!!selectedFamily}
        familyData={selectedFamily}
        onSave={handleSave}
      />
    </>
  );
};

export default FamilyList;
