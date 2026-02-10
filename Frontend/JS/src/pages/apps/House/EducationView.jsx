import React from "react";
import { Modal, Row, Col } from "react-bootstrap";

const EducationView = ({ isOpen, onClose, education, house }) => {
  if (!education) return null;

  return (
    <Modal show={isOpen} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          Education Details - {house?.owner} ({house?.family_name})
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="mb-3">
          <Col md={6}><b>No. of Students:</b> {education.no_of_students}</Col>
          <Col md={6}><b>Highest Education:</b> {education.highest_education_level}</Col>
          <Col md={6}><b>Male Students:</b> {education.n_male}</Col>
          <Col md={6}><b>Female Students:</b> {education.n_female}</Col>
        </Row>

        <hr />
        <h5>📘 Academic Milestones</h5>
        <Row>
          <Col md={4}><b>10th Pass:</b> {education.tenth_pass}</Col>
          <Col md={4}><b>+1 Pass:</b> {education.plus_one_pass}</Col>
          <Col md={4}><b>+2 Pass:</b> {education.plus_two_pass}</Col>
          <Col md={4}><b>Diploma:</b> {education.diploma_pass}</Col>
          <Col md={4}><b>Degree:</b> {education.degree_pass}</Col>
          <Col md={4}><b>PG:</b> {education.pg_pass}</Col>
          <Col md={4}><b>Professional:</b> {education.professional_pass}</Col>
          <Col md={4}><b>Govt Exam:</b> {education.govt_exam_pass}</Col>
          <Col md={4}><b>Dropouts:</b> {education.dropouts}</Col>
          <Col md={4}><b>Illiterate:</b> {education.illiterate}</Col>
          <Col md={4}><b>Special Needs:</b> {education.special_needs}</Col>
        </Row>
      </Modal.Body>
    </Modal>
  );
};

export default EducationView;
