// src/pages/apps/Tasks/List/ViewFamilyForm.jsx
import React from "react";
import { Modal, Card } from "react-bootstrap";

const ViewFamilyForm = ({ isOpen, onClose, family }) => {
  if (!family) return null;

  return (
    <Modal show={isOpen} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>🏠 Family Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Card className="shadow-sm border-0">
          <Card.Body>
            <p>
              <strong>Family Name:</strong> {family?.family_name}
            </p>
            <p>
              <strong>House Number:</strong> {family?.h_no}
            </p>
          </Card.Body>
        </Card>
      </Modal.Body>
    </Modal>
  );
};

export default ViewFamilyForm;
