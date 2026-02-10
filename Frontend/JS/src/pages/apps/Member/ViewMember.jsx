import React, { useState } from "react";
import { Row, Col, Card, Button, Modal, Form } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const ViewMember = ({ show, onHide, member, wards }) => {
  const [activeSection, setActiveSection] = useState("basic");

  if (!member) return null;

  /* ---------- Helpers ---------- */

  const yesNoIcon = (val) =>
    val ? (
      <FontAwesomeIcon icon={faCheckCircle} className="text-success fs-5" />
    ) : (
      <FontAwesomeIcon icon={faTimesCircle} className="text-danger fs-5" />
    );

  const yesNo = (val) => (val ? "Yes" : "No");

  const getConstituencyName = (id) => {
    if (!wards || !id) return "—";
    return (
      wards.find((w) => Number(w.id) === Number(id))?.constituency || "—"
    );
  };

  const calculateAge = (dob) => {
    if (!dob) return "—";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  /* ---------- UPDATED InfoItem (INPUT LOOK) ---------- */

  const InfoItem = ({ label, value }) => (
    <Col md={6} className="mb-3">
      <Form.Group>
        <Form.Label className="fw-semibold">{label}</Form.Label>
        <Form.Control
          type="text"
          value={value ?? ""}
          readOnly
          className="bg-white"
        />
      </Form.Group>
    </Col>
  );

  /* ---------- Excel Export ---------- */

  const handleExportExcel = () => {
    const exportData = {
      "Name (English)": member.m_name_en || "",
      "Name (Malayalam)": member.m_name_ml || "",
      Gender: member.m_gender || "",
      "Date of Birth": member.date_of_birth || "",
      Age: calculateAge(member.date_of_birth),
      "Marital Status": member.marital_status || "",
      Phone: member.phone_no || "",
      "Blood Group": member.blood_grp || "",
      Religion: member.religion || "",
      Caste: member.caste || "",

      Family: member.family_name_en || member.family_name_ml || "",
      "House No": member.h_no || "",
      "House Owner": member.owner_name || "",

      Employed: yesNo(member.job_status),
      "Job Country": member.job_country || "",
      "Monthly Income": member.monthly_income || "",
      Organization: member.organization || "",
      "Organization Type": member.org_type || "",

      "Voter ID": member.voter_id_number || "",
      Constituency: getConstituencyName(member.constituency_id),
      Ward: member.ward || "",
      "Polling Booth": member.polling_booth_no || "",

      "SIR 2002": yesNo(member.has_2002),
      "Epic ID": member.epic_id || "",

      Pension: yesNo(member.m_pension),
      Disability: yesNo(member.m_disability),
      "Health Insurance": yesNo(member.m_health_insurance),
      "Chronic Disease":
        member.has_chronic_disease ? member.chronic_disease : "No",
    };

    const ws = XLSX.utils.json_to_sheet([exportData]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Member Details");
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

    saveAs(
      new Blob([buffer], { type: "application/octet-stream" }),
      `${member.m_name_en || "member"}_details.xlsx`
    );
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      scrollable
      backdrop="static"
    >
      <Modal.Header closeButton>
        <Modal.Title>👤 Member Details</Modal.Title>
      </Modal.Header>

      <Modal.Body
              className="bg-light"
              style={{
                height: window.innerWidth > 768 ? "300px" : "auto",
                minHeight: window.innerWidth > 768 ? "50px" : "auto",
                maxHeight: window.innerWidth > 768 ? "500px" : "90vh",
                overflowY: "auto",
                padding: "1.5rem 1.5rem 1rem",
                borderRadius: "0 0 0.5rem 0.5rem",
              }}
            >
        <div className="container-fluid">

          {/* Tabs */}
          <div className="d-flex justify-content-around mb-3 border-bottom text-center">
            {[
              { key: "basic", label: "Basic Details" },
              { key: "family", label: "Family Details" },
              { key: "education", label: "Education" },
              { key: "job", label: "Job Details" },
              { key: "political", label: "Political" },
              { key: "health", label: "Health" },
            ].map((tab) => (
              <div
                key={tab.key}
                onClick={() => setActiveSection(tab.key)}
                style={{
                  cursor: "pointer",
                  padding: "10px",
                  borderBottom:
                    activeSection === tab.key
                      ? "3px solid #0d6efd"
                      : "3px solid transparent",
                  color:
                    activeSection === tab.key
                      ? "#0d6efd"
                      : "rgba(0,0,0,0.7)",
                }}
              >
                {tab.label}
              </div>
            ))}
          </div>

          {/* Content */}
          <Row>
            {activeSection === "basic" && (
              <>
                <InfoItem label="Name (EN)" value={member.m_name_en} />
                <InfoItem label="Name (ML)" value={member.m_name_ml} />
                <InfoItem label="Gender" value={member.m_gender} />
                <InfoItem label="DOB" value={member.date_of_birth} />
                <InfoItem label="Age" value={calculateAge(member.date_of_birth)} />
                <InfoItem label="Marital Status" value={member.marital_status} />
                <InfoItem label="Phone" value={member.phone_no} />
                <InfoItem label="Blood Group" value={member.blood_grp} />
                <InfoItem label="Religion" value={member.religion} />
                <InfoItem label="Caste" value={member.caste} />
              </>
            )}
          </Row>
        </div>
      </Modal.Body>

      <Modal.Footer className="justify-content-between">
        <Button variant="success" onClick={handleExportExcel}>
          📥 Export to Excel
        </Button>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ViewMember;
