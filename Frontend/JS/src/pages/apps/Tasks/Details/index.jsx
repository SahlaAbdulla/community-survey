import React, { useEffect, useState } from "react";
import { Row, Col, Card, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import api from "../../../../api/axios";
import { toast } from "react-toastify";
import WardForm from "./WardForm";
import "./WardDetails.css"; // ✅ Add this line for custom styles

const WardDetails = () => {
  const [ward, setWard] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchWard = async () => {
    try {
      const res = await api.get("wards/");
      if (res.data && res.data.length > 0) {
        setWard(res.data[0]);
      }
    } catch (err) {
      console.error("Error fetching ward:", err);
      toast.error("Failed to load ward details!");
    }
  };

  useEffect(() => {
    fetchWard();
  }, []);

  const handleSave = async (data) => {
    try {
      if (ward) {
        const res = await api.put(`wards/${ward.id}/`, data);
        toast.success("✅ Ward updated successfully!");
        setWard(res.data);
      } else {
        const res = await api.post("wards/", data);
        toast.success("✅ Ward added successfully!");
        setWard(res.data);
      }
      setShowForm(false);
    } catch (err) {
      console.error("Error saving ward:", err);
      toast.error("❌ Failed to save ward!");
    }
  };

  return (
    <>
      <div className="container-fluid mt-4 px-3">
        <Card className="ward-card shadow-lg border-0 rounded-4">
          <Card.Header className="bg-gradient text-white py-3 px-4 d-flex justify-content-between align-items-center rounded-top-4">
            <h5 className="mb-0 fw-bold d-flex align-items-center">
              <i className="mdi mdi-file-document-outline me-2 fs-4"></i>
              Ward Details
            </h5>
            <Button
              size="sm"
              variant="light"
              className="rounded-circle edit-btn shadow-sm"
              onClick={() => setShowForm(true)}
              title="Edit Ward Details"
            >
              <FontAwesomeIcon icon={faEdit} />
            </Button>
          </Card.Header>

          <Card.Body className="p-4 bg-white">
            {ward ? (
          <Row className="gy-4">
  <Col md={6}>
    <div className="detail-box">
  <h6>Booth No</h6>
  <div className="village-container">
    {Array.isArray(ward.polling_booth_no) && ward.polling_booth_no.length > 0 ? (
  ward.polling_booth_no.map((booth, index) => (
    <span key={index} className="village-pill">
      {booth.polling_booth_no} {booth.booth_name ? `- ${booth.booth_name}` : ""}
    </span>
  ))
) : (
  <span className="text-muted">-</span>
)}

  </div>
</div>


    <div className="detail-box">
      <h6>Panchayath</h6>
      <div className="village-container">
        {Array.isArray(ward.panchayaths) && ward.panchayaths.length > 0 ? (
          ward.panchayaths.map((panchayath, index) => (
            <span key={index} className="village-pill">
              {panchayath}
            </span>
          ))
        ) : (
          <span className="text-muted">-</span>
        )}
      </div>
    </div>

    <div className="detail-box">
      <h6>Block</h6>
      <p>{ward.block || "-"}</p>
    </div>

    <div className="detail-box">
      <h6>Sub District</h6>
      <p>{ward.sub_district || "-"}</p>
    </div>
  </Col>

  <Col md={6}>
    <div className="detail-box">
  <h6>Post & Pincode</h6>
  <div className="village-container">
    {Array.isArray(ward.posts) && ward.posts.length > 0 ? (
      ward.posts.map((p, index) => (
        <span key={index} className="village-pill">
          {p.post} - {p.pincode}
        </span>
      ))
    ) : (
      <span className="text-muted">-</span>
    )}
  </div>
</div>
<div className="detail-box">
  <h6>Ward</h6>
  <div className="village-container">
    {Array.isArray(ward.ward) && ward.ward.length > 0 ? (
      ward.ward.map((w, index) => (
        <span key={index} className="village-pill">
          {w}
        </span>
      ))
    ) : (
      <span className="text-muted">-</span>
    )}
  </div>
</div>


    <div className="detail-box">
      <h6>Village</h6>
      <div className="village-container">
        {Array.isArray(ward.villages) && ward.villages.length > 0 ? (
          ward.villages.map((village, index) => (
            <span key={index} className="village-pill">
              {village}
            </span>
          ))
        ) : (
          <span className="text-muted">-</span>
        )}
      </div>
    </div>

    <div className="detail-box">
      <h6>District</h6>
      <p>{ward.district || "-"}</p>
    </div>

    <div className="detail-box">
      <h6>Constituency</h6>
      <p>{ward.constituency || "-"}</p>
    </div>
  </Col>
</Row>
            ) : (
              <div className="text-center text-muted py-4">
                No ward details available
              </div>
            )}
          </Card.Body>
        </Card>
      </div>

      <WardForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        isEditable={!!ward}
        wardData={ward}
        onSave={handleSave}
      />
    </>
  );
};

export default WardDetails;
