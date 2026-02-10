import React, { useState } from "react";
import { Modal, Row, Col, Card, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const ViewHouseForm = ({ isOpen, onClose, houseData }) => {
  const [activeSection, setActiveSection] = useState("basic");

  if (!houseData) return null;

  /* ---------------- HELPERS ---------------- */
  const yesNoIcon = (val) =>
    val ? (
      <FontAwesomeIcon icon={faCheckCircle} className="text-success fs-5" />
    ) : (
      <FontAwesomeIcon icon={faTimesCircle} className="text-danger fs-5" />
    );

  const displayValue = (main, other) => {
    if (!main) return "—";
    if (main === "Other" && other) return other;
    return main;
  };

  const InfoItem = ({ label, value }) => (
    <Col md={6} className="mb-2">
      <Card className="border-light shadow-sm p-2">
        <div className="d-flex align-items-center">
          <strong className="fw-semibold text-dark">{label}:</strong>
          <span className="fw-semibold text-dark ms-2">
            {value !== undefined && value !== null && value !== "" ? value : "—"}
          </span>
        </div>
      </Card>
    </Col>
  );

  const fullHouseNo =
    houseData.h_no && houseData.sub
      ? `${houseData.h_no} ${houseData.sub.toUpperCase()}`
      : houseData.h_no || "—";

  /* ---------------- EXPORT ---------------- */
  const handleExportExcel = () => {
    const exportData = {
      "Owner Name (English)": houseData.owner_en || "",
      "Owner Name (Malayalam)": houseData.owner_ml || "",
      "House Number": fullHouseNo,
      "Family Name":
        `${houseData.family_name_en || ""} / ${houseData.family_name_ml || ""}`,
      "Cluster":
        houseData.cluster
          ? `${houseData.cluster.name_english} / ${houseData.cluster.name_malayalam}`
          : "",
      "Contact Number": houseData.phone_no || "",
      Address: houseData.h_address || "",
      "House Status": displayValue(
        houseData.h_status,
        houseData.h_status_other
      ),
      "House Type": displayValue(
        houseData.h_type,
        houseData.h_type_other
      ),
      "Financial Status": houseData.financial_status || "",
      Land: houseData.land ? "Yes" : "No",
      "Road Access": displayValue(
        houseData.road_access_type,
        houseData.road_access_type_other
      ),
      "Water Source": displayValue(
        houseData.w_source,
        houseData.water_yes_other || houseData.water_no_other
      ),
      "Gas Connection": houseData.g_connection ? "Yes" : "No",
      Biogas: houseData.biogas ? "Yes" : "No",
      Solar: houseData.solar ? "Yes" : "No",
      Electricity: houseData.h_electricity ? "Yes" : "No",
      Refrigerator: houseData.h_refrigerator ? "Yes" : "No",
      "Washing Machine": houseData.h_washing_machine ? "Yes" : "No",
      Toilet: houseData.h_toilet ? "Yes" : "No",
      "Waste Disposal": displayValue(
        houseData.waste_disposal_method,
        houseData.waste_disposal_method_other
      ),
      Agriculture: houseData.h_agriculture ? "Yes" : "No",
      "Agriculture Type": displayValue(
        houseData.agriculture_type,
        houseData.agriculture_type_other
      ),
      Livestock: houseData.h_livestock ? "Yes" : "No",
      "Livestock Type": displayValue(
        houseData.livestock_type,
        houseData.livestock_type_other
      ),
      "Livestock Count": houseData.livestock_count || "",
      "Ration Card": houseData.ration_card ? "Yes" : "No",
      "Ration Card Number": houseData.ration_card_number || "",
      "Ration Card Category": houseData.ration_card_category || "",
      Remark: houseData.remark || "",
    };

    const ws = XLSX.utils.json_to_sheet([exportData]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "House Details");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([excelBuffer], { type: "application/octet-stream" }),
      `${houseData.owner_en || "house"}_details.xlsx`
    );
  };

  return (
    <Modal show={isOpen} onHide={onClose} size="lg" centered className="sticky-modal">
      <Modal.Header closeButton>
        <Modal.Title>🏠 House Details</Modal.Title>
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
        {/* ==== Tabs ==== */}
        <div
          className="d-flex justify-content-around mb-3 border-bottom text-center"
          style={{
            fontWeight: "500",
            fontSize: "0.95rem",
          }}
        >
          {[
            { key: "basic", label: "Basic Information" },
            { key: "facilities", label: "House Facilities" },
            { key: "other", label: "Other Details" },
            { key: "ration", label: "Ration Card Details" },
          ].map((tab) => (
            <div
              key={tab.key}
              onClick={() => setActiveSection(tab.key)}
              style={{
                flex: 1,
                cursor: "pointer",
                padding: "10px 0",
                color: activeSection === tab.key ? "#0d6efd" : "rgba(0,0,0,0.7)",
                borderBottom:
                  activeSection === tab.key
                    ? "3px solid #0d6efd"
                    : "3px solid transparent",
                transition: "all 0.25s ease-in-out",
              }}
            >
              {tab.label}
            </div>
          ))}
        </div>

        <Row>
          {activeSection === "basic" && (
            <>
              <InfoItem label="Owner (EN)" value={houseData.owner_en} />
              <InfoItem label="Owner (ML)" value={houseData.owner_ml} />
              <InfoItem label="House Number" value={fullHouseNo} />
              <InfoItem label="Contact" value={houseData.phone_no} />
              <InfoItem label="Address" value={houseData.h_address} />
              <InfoItem
                label="House Status"
                value={displayValue(
                  houseData.h_status,
                  houseData.h_status_other
                )}
              />
              <InfoItem
                label="Financial Status"
                value={houseData.financial_status}
              />
              <InfoItem label="Land" value={yesNoIcon(houseData.land)} />
              <InfoItem label="Remark" value={houseData.remark} />
            </>
          )}

          {activeSection === "facilities" && (
            <>
              <InfoItem
                label="Cluster"
                value={
                  houseData.cluster
                    ? `${houseData.cluster.name_english} / ${houseData.cluster.name_malayalam}`
                    : "—"
                }
              />
              <InfoItem
                label="House Type"
                value={displayValue(
                  houseData.h_type,
                  houseData.h_type_other
                )}
              />
              <InfoItem
                label="Road Access"
                value={displayValue(
                  houseData.road_access_type,
                  houseData.road_access_type_other
                )}
              />
              <InfoItem
                label="Water Source"
                value={displayValue(
                  houseData.w_source,
                  houseData.water_yes_other || houseData.water_no_other
                )}
              />
              <InfoItem label="Gas" value={yesNoIcon(houseData.g_connection)} />
              <InfoItem label="Biogas" value={yesNoIcon(houseData.biogas)} />
              <InfoItem label="Solar" value={yesNoIcon(houseData.solar)} />
              <InfoItem
                label="Electricity"
                value={yesNoIcon(houseData.h_electricity)}
              />
              <InfoItem
                label="Refrigerator"
                value={yesNoIcon(houseData.h_refrigerator)}
              />
              <InfoItem
                label="Washing Machine"
                value={yesNoIcon(houseData.h_washing_machine)}
              />
              <InfoItem label="Toilet" value={yesNoIcon(houseData.h_toilet)} />
              <InfoItem
                label="Waste Disposal"
                value={displayValue(
                  houseData.waste_disposal_method,
                  houseData.waste_disposal_method_other
                )}
              />
            </>
          )}

          {activeSection === "other" && (
            <>
              <InfoItem
                label="Agriculture"
                value={yesNoIcon(houseData.h_agriculture)}
              />
              {houseData.h_agriculture && (
                <InfoItem
                  label="Agriculture Type"
                  value={displayValue(
                    houseData.agriculture_type,
                    houseData.agriculture_type_other
                  )}
                />
              )}
              <InfoItem
                label="Livestock"
                value={yesNoIcon(houseData.h_livestock)}
              />
              {houseData.h_livestock && (
                <>
                  <InfoItem
                    label="Livestock Type"
                    value={displayValue(
                      houseData.livestock_type,
                      houseData.livestock_type_other
                    )}
                  />
                  <InfoItem
                    label="Livestock Count"
                    value={houseData.livestock_count}
                  />
                </>
              )}
            </>
          )}

          {activeSection === "ration" && (
            <>
              <InfoItem
                label="Ration Card"
                value={yesNoIcon(houseData.ration_card)}
              />
              {houseData.ration_card && (
                <>
                  <InfoItem
                    label="Ration Number"
                    value={houseData.ration_card_number}
                  />
                  <InfoItem
                    label="Ration Category"
                    value={houseData.ration_card_category}
                  />
                </>
              )}
            </>
          )}
        </Row>
      </Modal.Body>

      <Modal.Footer className="bg-white">
        <Button variant="success" onClick={handleExportExcel}>
          📥 Export to Excel
        </Button>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ViewHouseForm;
