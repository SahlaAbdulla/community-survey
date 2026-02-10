import React from "react";
import { Modal, Button } from "react-bootstrap";

const EducationViewMember = ({ isOpen, onClose, eduMember }) => {
  if (!eduMember) return null;

  return (
    <Modal show={isOpen} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Education Member Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p><strong>Name:</strong> {eduMember?.member_name || eduMember?.member?.m_name}</p>
        <p><strong>Family:</strong> {eduMember?.family_name || eduMember?.member?.family_name}</p>
        <p><strong>Gender:</strong> {eduMember?.gender}</p>
        <p><strong>Age:</strong> {eduMember?.age}</p>

        <hr />
        <h5>📘 Education Info</h5>
        <p><strong>Literate:</strong> {eduMember?.is_literate ? "Yes" : "No"}</p>
        <p><strong>Currently Studying:</strong> {eduMember?.is_studying ? "Yes" : "No"}</p>
        {eduMember?.is_studying && (
          <>
            <p><strong>Current Class:</strong> {eduMember?.current_class}</p>
            <p><strong>Institution:</strong> {eduMember?.institution_name} ({eduMember?.institution_type})</p>
          </>
        )}
        <p><strong>Highest Qualification:</strong> {eduMember?.highest_qualification}</p>
        <p><strong>Vocational Training:</strong> {eduMember?.vocational_training}</p>

        <hr />
        <h5>💻 Digital Skills</h5>
        <p><strong>Knows Computer:</strong> {eduMember?.knows_computer ? "Yes" : "No"}</p>
        <p><strong>Knows Internet:</strong> {eduMember?.knows_internet ? "Yes" : "No"}</p>
        <p><strong>Knows Smartphone:</strong> {eduMember?.knows_smartphone ? "Yes" : "No"}</p>

        {eduMember?.is_dropout && (
          <>
            <hr />
            <h5>🚫 Dropout Details</h5>
            <p><strong>Dropout Class:</strong> {eduMember?.dropout_class}</p>
            <p><strong>Dropout Reason:</strong> {eduMember?.dropout_reason}</p>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EducationViewMember;
