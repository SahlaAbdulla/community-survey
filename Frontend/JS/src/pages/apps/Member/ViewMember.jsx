import React, { useState } from "react";
import { Row, Col, Card, Button, Modal, Form } from "react-bootstrap";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const ViewMember = ({ show, onHide, member, wards }) => {
  const [activeSection, setActiveSection] = useState("basic");

  if (!member) return null;

  /* ---------------- Helpers ---------------- */

  const yesNo = (val) => (val ? "Yes" : "No");

  const safe = (val) => val || "—";

  const calculateAge = (dob) => {
    if (!dob) return "—";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const getConstituencyName = (id) => {
    if (!id || !wards) return "—";
    return (
      wards.find((w) => Number(w.id) === Number(id))?.constituency || "—"
    );
  };

  /* ---------------- Info Field ---------------- */

  const InfoItem = ({ label, value }) => (
    <Col md={6} className="mb-3">
      <Form.Group>
        <Form.Label className="fw-semibold">{label}</Form.Label>
        <Form.Control
          type="text"
          value={safe(value)}
          readOnly
          className="bg-white"
        />
      </Form.Group>
    </Col>
  );

  /* ---------------- Excel Export ---------------- */

  const handleExportExcel = () => {
    const exportData = {
      Name: member.m_name_en,
      Gender: member.m_gender,
      DOB: member.date_of_birth,
      Age: calculateAge(member.date_of_birth),
      Phone: member.phone_no,
      Religion: member.religion,
      Caste: member.caste,
      BloodGroup: member.blood_grp,

      Family: member.family_name_en || member.family_name_ml,
      HouseOwner: member.owner_name,

      Employed: yesNo(member.job_status),
      JobCountry: member.job_country,
      Income: member.monthly_income,

      VoterID: member.voter_id_number,
      Constituency: getConstituencyName(member.constituency_id),
      Ward: member.ward,
      PollingBooth: member.polling_booth_no,

      Pension: yesNo(member.m_pension),
      Disability: yesNo(member.m_disability),
      HealthInsurance: yesNo(member.m_health_insurance),
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

  /* ---------------- UI ---------------- */

  const tabs = [
    { key: "basic", label: "Basic Details" },
   
    { key: "education", label: "Education Details" },
    { key: "job", label: "Job Details" },
    { key: "political", label: "Election Details" },
    { key: "health", label: "Health" },
    { key: "other", label: "Other Details" },
  ];

  return (
    <Modal show={show} onHide={onHide} size="lg" centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title>👤 Member Details</Modal.Title>
      </Modal.Header>

      <Modal.Body className="bg-light p-4">
        {/* Tabs */}
        <div className="d-flex justify-content-around mb-4 border-bottom">
          {tabs.map((tab) => (
            <div
              key={tab.key}
              onClick={() => setActiveSection(tab.key)}
              style={{
                cursor: "pointer",
                padding: "10px",
                fontWeight: 500,
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

        <Row className="g-3">
          {/* BASIC */}
          {activeSection === "basic" && (
            <>
              <InfoItem label="Name (EN)" value={member.m_name_en} />
              <InfoItem label="Name (ML)" value={member.m_name_ml} />
              <InfoItem label="Family" value={member.family_name_en || member.family_name_ml} />
              <InfoItem label="House Owner" value={member.owner_name} />
              <InfoItem label="Gender" value={member.m_gender} />
              <InfoItem label="DOB" value={member.date_of_birth} />
              <InfoItem label="Age" value={calculateAge(member.date_of_birth)} />
              <InfoItem label="Phone" value={member.phone_no} />
               <InfoItem label="Relation" value={member.m_relation} />
                <InfoItem label="Marital Status" value={member.marital_status} />
              <InfoItem label="Religion" value={member.religion} />
              <InfoItem label="Caste" value={member.caste} />
              <InfoItem label="Blood Group" value={member.blood_grp} />
            </>
          )}

          {/* FAMILY */}
         
          {/* EDUCATION */}
          {activeSection === "education" && (
            <>
              <InfoItem label="Education" value={member.education} />
              <InfoItem label="Stream" value={member.subject_stream} />
              <InfoItem label="Status" value={member.education_status} />
            </>
          )}

          {/* JOB */}
          {activeSection === "job" && (
            <>
              <InfoItem label="Employed" value={yesNo(member.job_status)} />
              <InfoItem label="Job Country" value={member.job_country} />
              <InfoItem label="Monthly Income" value={member.monthly_income} />
             
            </>
          )}

          {/* POLITICAL */}
          {activeSection === "political" && (
            <>
              <InfoItem label="Election ID" value={yesNo(member.election_id)} />
              <InfoItem label="RollNo SEC" value={member.roll_no_sec} />
              <InfoItem label="SEC ID" value={member.voter_id_number} />
              <InfoItem label="RollNo ECI" value={member.roll_no_ceo} />
              <InfoItem label="EPIC ID" value={member.epic_id} />
              <InfoItem label="SIR 2002" value={yesNo(member.has_2002)} />
              <InfoItem label="RollNo-2002" value={member.roll_no_2002} />
              <InfoItem label="RollNo-2025" value={member.roll_no_2025} />
               <InfoItem label="Guardian's Name(EN)" value={member.guardian_en} />
               <InfoItem label="Guardian's Name(ML)" value={member.guardian_ml} />
               <InfoItem label="Relation" value={member.g_relation} />
              <InfoItem
                label="Constituency"
                value={getConstituencyName(member.constituency_id)}
              />
              <InfoItem label="Ward" value={member.ward} />
              <InfoItem label="Polling Booth" value={member.polling_booth_no} />
              <InfoItem label="Political Party" value={member.political_party} />
              
             
            </>
          )}

          {/* HEALTH */}
          {activeSection === "health" && (
            <>
              <InfoItem label="Pension" value={yesNo(member.m_pension)} />
              <InfoItem label="Disability" value={yesNo(member.m_disability)} />
              <InfoItem
                label="Health Insurance"
                value={yesNo(member.m_health_insurance)}
              />
              <InfoItem
                label="Chronic Disease"
                value={
                  member.has_chronic_disease
                    ? member.chronic_disease
                    : "No"
                }
              />
            </>
          )}

          {activeSection === "other" && (
            <>
              
              <InfoItem label="Organization" value={member.organization} />
              <InfoItem label="Org Type" value={member.org_type} />
            </>
          )}
        </Row>
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