import React from "react";
import { Modal, Card, Row, Col } from "react-bootstrap";

const ViewWardForm = ({ isOpen, onClose, ward }) => {
  if (!ward) return null;

  const renderField = (label, value) => (
    <Col md={6} className="mb-3">
      <div className="d-flex flex-column">
        <span className="fw-bold text-dark" style={{ fontSize: "0.95rem" }}>
          {label}
        </span>
        <span
          className="text-secondary"
          style={{ fontSize: "1rem", fontWeight: "500" }}
        >
          {value || "-"}
        </span>
      </div>
    </Col>
  );

  return (
    <Modal show={isOpen} onHide={onClose} centered size="md">
      <Modal.Header closeButton>
        <Modal.Title className="fw-bold fs-5 text-dark">
          📋 Ward Details
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Card className="shadow-sm border-0">
          <Card.Body>
            <Row className="gy-3">
<Form.Group as={Col} md={6} controlId="formPost">
  <Form.Label>Post</Form.Label>
  <div className="d-flex">
    <Form.Control
      type="text"
      value={ward.post}
      onChange={(e) => setWard({ ...ward, post: e.target.value })}
    />
    <Button
      variant="outline-primary"
      className="ms-2"
      onClick={handleAddPost}
    >
      +
    </Button>
  </div>
</Form.Group>

              {renderField("PIN Code", ward?.pin)}
              {renderField("Constituency", ward?.constituency)}
              {renderField("Sub District", ward?.sub_district)}
<Form.Group as={Col} md={6} controlId="formVillage">
  <Form.Label>Village</Form.Label>
  <div className="d-flex">
    <Form.Control
      type="text"
      value={ward.village}
      onChange={(e) => setWard({ ...ward, village: e.target.value })}
    />
    <Button
      variant="outline-primary"
      className="ms-2"
      onClick={handleAddVillage}
    >
      +
    </Button>
  </div>
</Form.Group>

             <Form.Group as={Col} md={6} controlId="formPanchayath">
  <Form.Label>Panchayath</Form.Label>
  <div className="d-flex">
    <Form.Control
      type="text"
      value={ward.panchayath}
      onChange={(e) => setWard({ ...ward, panchayath: e.target.value })}
    />
    <Button
      variant="outline-primary"
      className="ms-2"
      onClick={handleAddPanchayath}
    >
      +
    </Button>
  </div>
</Form.Group>

              {renderField("Block", ward?.block)}
              {renderField("Polling Booth No", ward?.polling_booth_no)}
            </Row>
          </Card.Body>
        </Card>
      </Modal.Body>
    </Modal>
  );
};

export default ViewWardForm;
