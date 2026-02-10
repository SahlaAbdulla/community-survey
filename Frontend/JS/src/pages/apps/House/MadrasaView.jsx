import React from "react";
import { Modal, Row, Col, Button } from "react-bootstrap";

const MadrasaViewForm = ({ isOpen, onClose, madrasaData }) => {
  if (!madrasaData) return null;

  return (
    <Modal show={isOpen} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Madrasa Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col md={6}>
            <strong>Madrasa Name:</strong>
            <p>{madrasaData.madrasa_name}</p>
          </Col>
          <Col md={6}>
            <strong>Location:</strong>
            <p>{madrasaData.location || "-"}</p>
          </Col>

          <Col md={4}>
            <strong>Total Students:</strong>
            <p>{madrasaData.total_students}</p>
          </Col>
          <Col md={4}>
            <strong>Male Students:</strong>
            <p>{madrasaData.male_students}</p>
          </Col>
          <Col md={4}>
            <strong>Female Students:</strong>
            <p>{madrasaData.female_students}</p>
          </Col>

          <Col md={6}>
            <strong>Total Teachers:</strong>
            <p>{madrasaData.total_teachers}</p>
          </Col>
          <Col md={6}>
            <strong>Teacher Qualification:</strong>
            <p>{madrasaData.teacher_qualification || "-"}</p>
          </Col>

          <Col md={6}>
            <strong>Syllabus / Books:</strong>
            <p>{madrasaData.syllabus_books || "-"}</p>
          </Col>
          <Col md={6}>
            <strong>Class Timings:</strong>
            <p>{madrasaData.class_timings || "-"}</p>
          </Col>

          <Col md={4}>
            <strong>Arabic Special:</strong>
            <p>{madrasaData.arabic_special ? "Yes" : "No"}</p>
          </Col>
          <Col md={4}>
            <strong>Building Status:</strong>
            <p>{madrasaData.building_status}</p>
          </Col>
          <Col md={4}>
            <strong>Toilet Facility:</strong>
            <p>{madrasaData.has_toilet ? "Yes" : "No"}</p>
          </Col>
          <Col md={4}>
            <strong>Water Facility:</strong>
            <p>{madrasaData.has_water ? "Yes" : "No"}</p>
          </Col>

          {/* House Info */}
          <Col md={12} className="mt-3">
            <strong>House:</strong>
            <p>
              {madrasaData.house?.owner} (
              {madrasaData.house?.family_name} {madrasaData.house?.h_no}
              {madrasaData.house?.sub})
            </p>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default MadrasaViewForm;
