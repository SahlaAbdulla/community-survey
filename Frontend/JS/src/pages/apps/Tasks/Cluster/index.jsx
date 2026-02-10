import React, { useEffect, useState } from "react";
import { Card, Button, Table, Modal } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import api from "../../../../api/axios";
import ClusterForm from "./ClusterForm";
import "./ClusterIndex.css";

const ClusterIndex = () => {
  const [clusters, setClusters] = useState([]);
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // 🔥 For delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clusterToDelete, setClusterToDelete] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // ✅ Fetch clusters
  const fetchClusters = async () => {
    try {
      const res = await api.get("clusters/");
      setClusters(res.data || []);
    } catch (err) {
      console.error("Error fetching clusters:", err);
      toast.error("❌ Failed to load clusters!");
    }
  };

  useEffect(() => {
    fetchClusters();
  }, []);

  // ✅ Save (Add/Edit)
  const handleSave = async (data) => {
    try {
      if (selectedCluster) {
        await api.put(`clusters/${selectedCluster.id}/`, data);
        toast.success("✅ Cluster updated successfully!");
      } else {
        await api.post("clusters/", data);
        toast.success("✅ Cluster added successfully!");
      }
      setShowForm(false);
      setSelectedCluster(null);
      fetchClusters();
    } catch (err) {
      console.error("Error saving cluster:", err);
      toast.error("❌ Failed to save cluster!");
    }
  };

  // ✅ Delete
  const handleDelete = async (id) => {
    try {
      await api.delete(`clusters/${id}/`);
      toast.success("🗑️ Cluster deleted successfully!");
      fetchClusters();
    } catch (err) {
      console.error("Error deleting cluster:", err);
      toast.error("❌ Failed to delete cluster!");
    }
  };

  return (
    <div className="container-fluid mt-4 px-3">
      <Card className="shadow-lg border-0 rounded-4 cluster-card">
        <Card.Header className="bg-gradient text-white py-3 px-4 d-flex justify-content-between align-items-center rounded-top-4">
          <h5 className="mb-0 fw-bold d-flex align-items-center">
            <i className="mdi mdi-view-list-outline me-2 fs-4"></i>
            Cluster List
          </h5>
          <Button
            size="sm"
            variant="light"
            className="rounded-circle shadow-sm"
            title="Add Cluster"
            onClick={() => {
              setSelectedCluster(null);
              setShowForm(true);
            }}
          >
            <FontAwesomeIcon icon={faPlus} />
          </Button>
        </Card.Header>

        <Card.Body className="p-4 bg-white">
          {clusters.length > 0 ? (
            <div className="table-responsive">
              <Table hover bordered className="align-middle">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Cluster Name (English)</th>
                    <th>Cluster Name (Malayalam)</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {clusters.map((cluster, index) => (
                    <tr key={cluster.id}>
                      <td>{index + 1}</td>
                      <td>{cluster.name_english || "-"}</td>
                      <td>{cluster.name_malayalam || "-"}</td>

                      <td className="text-start p-0 ps-2">
                        <div className="action-buttons">
                          <Button
                            size="sm"
                            className="btn-edit"
                            title="Edit Cluster"
                            onClick={() => {
                              setSelectedCluster(cluster);
                              setShowForm(true);
                            }}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </Button>

                          <Button
                            size="sm"
                            className="btn-delete"
                            title="Delete Cluster"
                            onClick={() => {
                              setClusterToDelete(cluster);
                              setShowDeleteModal(true);
                            }}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="text-center text-muted py-4">
              No clusters available
            </div>
          )}
        </Card.Body>
      </Card>

      {/* 🧾 Add/Edit Cluster Form Modal */}
      <ClusterForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        isEditable={!!selectedCluster}
        clusterData={selectedCluster}
        onSave={handleSave}
      />

      {/* 🗑️ Delete Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => {
          setShowDeleteModal(false);
          setConfirmDelete(false);
        }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {confirmDelete ? (
            <div className="text-danger">
              ⚠️ Are you absolutely sure you want to delete{" "}
              <b>{clusterToDelete?.name_english || "this cluster"}</b>?
            </div>
          ) : (
            <>
              Are you sure you want to delete{" "}
              <b>{clusterToDelete?.name_english || "this cluster"}</b>?
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowDeleteModal(false);
              setConfirmDelete(false);
            }}
          >
            Cancel
          </Button>

          <Button
            variant={confirmDelete ? "danger" : "outline-danger"}
            onClick={async () => {
              if (!confirmDelete) {
                setConfirmDelete(true);
              } else {
                await handleDelete(clusterToDelete.id);
                setShowDeleteModal(false);
                setConfirmDelete(false);
              }
            }}
          >
            {confirmDelete ? "Confirm Delete" : "Delete"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ClusterIndex;
