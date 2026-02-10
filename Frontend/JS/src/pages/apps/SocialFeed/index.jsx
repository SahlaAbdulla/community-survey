import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Row,
  Col,
  Card,
  Button,
  Table,
  Spinner,
  Modal,
} from "react-bootstrap";
import PageTitle from "@/components/PageTitle";
import ViewMember from "../Member/ViewMember";
import * as XLSX from "xlsx";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const VotersList = () => {
  const [members, setMembers] = useState([]);
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  const [showColumnSettings, setShowColumnSettings] = useState(false);
  // 🔵 SIR Filter
  const [sirFilter, setSirFilter] = useState(null);
// values: null | "ALL" | "1" | "2"


   // ✅ SORT STATE (A → Z default)
  const [sortConfig, setSortConfig] = useState({
  key: "roll_no_sec",
  direction: "asc",
});

  // 🔘 Booth Filter
const [boothFilter, setBoothFilter] = useState(null);

// Booth mapping (DB value → UI Booth)
const BOOTH_MAP = {
  "1": "01", // Booth 1 → 02-chammanor
  "2": "02", // Booth 2 → 03-chammanoor
};


  const columns = [
    { key: "name", label: "Name" },
    { key: "guardian", label: "Guardian's Name" },
    { key: "relation", label: "Relation" },
    { key: "roll_sec", label: "SEC Roll No" },
    { key: "sec_id", label: "SEC ID" },
    { key: "roll_ceo", label: "ECI Roll No" },
    { key: "epic", label: "EPIC ID" },
    { key: "house", label: "H No." },
    { key: "gender", label: "G/Age" },
    { key: "polling", label: "Polling Booth No" },
    { key: "roll_2002", label: "Roll No-2002" },
    { key: "roll_2025", label: "Roll No-2025" },
    { key: "ward", label: "Ward" },
    { key: "family", label: "Family Name" },
    { key: "family_common", label: "Family Name (Common)" },
  ];

  // ✅ visibleCols from localStorage
  const [visibleCols, setVisibleCols] = useState(() => {
    const saved = localStorage.getItem("voters_visible_columns");
    return saved
      ? JSON.parse(saved)
      : columns.reduce((acc, c) => {
          acc[c.key] = true;
          return acc;
        }, {});
  });

  const [tempCols, setTempCols] = useState({});

  useEffect(() => {
    fetchMembers();
    fetchFamilies();
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/members/`);
      setMembers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFamilies = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/families/`);
      setFamilies(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredMembers = members

// =======================
// 🔵 SEC FILTER
// =======================
.filter((m) => {
  if (!boothFilter) return true;

  const isSEC =
    (m.roll_no_sec && String(m.roll_no_sec).trim() !== "") ||
    (m.voter_id_number && String(m.voter_id_number).trim() !== "");

  if (!isSEC) return false;

  if (boothFilter === "1") {
    return m.polling_booth_no?.startsWith("01");
  }

  if (boothFilter === "2") {
    return m.polling_booth_no?.startsWith("02");
  }

  return true;
})

// =======================
// 🟢 SIR FILTER
// =======================
.filter((m) => {
  if (!sirFilter) return true;

  const isSIR =
    (m.epic_id && String(m.epic_id).trim() !== "") ||
    (m.roll_no_ceo && String(m.roll_no_ceo).trim() !== "");

  if (!isSIR) return false;

  if (sirFilter === "ALL") return true;

  if (sirFilter === "1") {
    return m.polling_booth_no?.startsWith("01");
  }

  if (sirFilter === "2") {
    return m.polling_booth_no?.startsWith("02");
  }

  return true;
})

// =======================
// 🔍 SEARCH (unchanged)
// =======================
.filter((m) => {
  const s = searchTerm.toLowerCase().trim();
  if (!s) return true;

  return (
    m.m_name_en?.toLowerCase().includes(s) ||
    m.guardian_en?.toLowerCase().includes(s) ||
    m.roll_no_sec?.toLowerCase().includes(s) ||
    m.roll_no_ceo?.toLowerCase().includes(s) ||
    m.epic_id?.toLowerCase().includes(s) ||
    m.voter_id_number?.toLowerCase().includes(s) ||
    m.polling_booth_no?.toLowerCase().includes(s)
  );
});


  


    const sortedMembers = [...filteredMembers].sort((a, b) => {
  const key = sortConfig.key;

  let aVal = a[key] ?? "";
  let bVal = b[key] ?? "";

  // 🔢 Numeric fields (Roll numbers)
  const numericKeys = [
    "roll_no_sec",
    "roll_no_ceo",
    "roll_no_2002",
    "roll_no_2025",
  ];

  if (numericKeys.includes(key)) {
    const numA = parseInt(aVal, 10);
    const numB = parseInt(bVal, 10);

    if (isNaN(numA) && isNaN(numB)) return 0;
    if (isNaN(numA)) return 1;
    if (isNaN(numB)) return -1;

    return sortConfig.direction === "asc"
      ? numA - numB
      : numB - numA;
  }

  // 🔤 Alphabetic fields (Name, Guardian, etc.)
  aVal = aVal.toString().toLowerCase();
  bVal = bVal.toString().toLowerCase();

  if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
  if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
  return 0;
});


  const totalPages = Math.ceil(sortedMembers.length / itemsPerPage);


  const paginatedMembers = sortedMembers.slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
);

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredMembers);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Voters List");
    XLSX.writeFile(workbook, "voters_list.xlsx");
  };

  // 🔽 SORT HEADER UI
  const sortHeader = (label, key) => (
    <div
      className="d-flex align-items-center gap-1"
      style={{ cursor: "pointer" }}
      onClick={() =>
        setSortConfig((prev) => ({
          key,
          direction:
            prev.key === key && prev.direction === "asc" ? "desc" : "asc",
        }))
      }
    >
      <span>{label}</span>
      <span style={{ fontSize: "20px", opacity: 0.7 }}>
  {sortConfig.key !== key && "▴"}
  {sortConfig.key === key &&
    (sortConfig.direction === "asc" ? "▴" : "▾")}
</span>

    </div>
  );

  const sortKeyMap = {
  name: "m_name_en",
  guardian: "guardian_en",
  roll_sec: "roll_no_sec",
  roll_ceo: "roll_no_ceo",
  epic: "epic_id",
  polling: "polling_booth_no",
  ward: "ward",
};


  return (
    <>
      <PageTitle title="Voters List" />

      <Row>
        <Col>
          <Card>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex align-items-center gap-3">
                <h4 className="mb-0">Voters</h4>
                {/* 🔘 Booth Filters */}
    <div className="d-flex gap-1">
      <Button
        size="sm"
        variant={boothFilter === null ? "primary" : "primary"}
      onClick={() => {
  setSirFilter(null);        // ⭐ IMPORTANT
  setBoothFilter(null);
  setSortConfig({ key: "roll_no_sec", direction: "asc" });
  setCurrentPage(1);
}}


      >
        All
      </Button>

      <Button
        size="sm"
        variant={boothFilter === "1" ? "primary" : "primary"}
       onClick={() => {
  setSirFilter(null);        // ⭐ FIX
  setBoothFilter("1");
  setCurrentPage(1);
}}

      >
        SEC B1
      </Button>

      <Button
        size="sm"
        variant={boothFilter === "2" ? "primary" : "primary"}
       onClick={() => {
  setSirFilter(null);        // ⭐ FIX
  setBoothFilter("2");
  setCurrentPage(1);
}}

      >
        SEC B2
      </Button>

      {/* 🔵 NEW SIR BUTTONS */}
  <Button
    size="sm"
    variant={sirFilter === "ALL" ? "success" : "primary"}
    onClick={() => {
  setBoothFilter(null);      // ⭐ IMPORTANT
  setSirFilter("ALL");
  setCurrentPage(1);
}}

  >
    SIR ALL
  </Button>

  <Button
    size="sm"
    variant={sirFilter === "1" ? "success" : "primary"}
    onClick={() => {
  setBoothFilter(null);      // ⭐ FIX
  setSirFilter("1");
  setCurrentPage(1);
}}

  >
    SIR B1
  </Button>

  <Button
    size="sm"
    variant={sirFilter === "2" ? "success" : "primary"}
    onClick={() => {
  setBoothFilter(null);      // ⭐ FIX
  setSirFilter("2");
  setCurrentPage(1);
}}

  >
    SIR B2
  </Button>
    </div>
  </div>
                <input
                  className="form-control"
                  style={{ width: 260 }}
                  placeholder="🔍 Search"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              {loading ? (
                <div className="text-center py-5">
                  <Spinner />
                </div>
              ) : (
                <>
                  <Table bordered hover responsive>
                    <thead>
                      <tr>
                        <th style={{ width: 80 }}>
                          <div className="d-flex align-items-center gap-2 justify-content-center">
                          <button
                            onClick={() => {
                              setTempCols(visibleCols);
                              setShowColumnSettings(true);
                            }}
                            style={{ border: "1px solid #ddd", background: "#f8f9fa", borderRadius: "6px", padding: "4px 6px", }}
                          >
                            ☰
                          </button>
                          <span>#</span>
                          </div>
                        </th>
                        
                        
                        {columns.map(
                          (c) =>
                            visibleCols[c.key] && (
                              <th key={c.key}>
  {sortKeyMap[c.key]
    ? sortHeader(c.label, sortKeyMap[c.key])
    : c.label}
</th>

                            )
                        )}
                      </tr>
                    </thead>

                    <tbody>
                      {paginatedMembers.map((m, idx) => (
                        <tr key={m.id}>
                          <td>
                            {(currentPage - 1) * itemsPerPage + idx + 1}
                          </td>

                          {visibleCols.name && (
  <td className="fw-bold">
    {m.display_name || m.m_name_en || "—"}
  </td>
)}
                          {visibleCols.guardian && (
                            <td className="fw-bold">{m.guardian_en || "—"}</td>
                          )}
                          {visibleCols.relation && (
                            <td>{m.g_relation || "—"}</td>
                          )}
                          {visibleCols.roll_sec && (
                            <td>{m.roll_no_sec || "—"}</td>
                          )}
                          {visibleCols.sec_id && (
                            <td>{m.voter_id_number || "—"}</td>
                          )}
                          {visibleCols.roll_ceo && (
                            <td>{m.roll_no_ceo || "—"}</td>
                          )}
                          {visibleCols.epic && <td>{m.epic_id || "—"}</td>}

                          {visibleCols.house && (
                            <td>
                              {m.h_no && m.sub
                                ? `${m.h_no} / ${m.sub}`
                                : "—"}
                            </td>
                          )}

                          {visibleCols.gender && (
                            <td>
                              {m.m_gender && m.m_age
                                ? `${m.m_gender} / ${m.m_age}`
                                : "—"}
                            </td>
                          )}

                          {visibleCols.polling && (
                            <td>{m.polling_booth_no || "—"}</td>
                          )}
                          {visibleCols.roll_2002 && (
                            <td>{m.roll_no_2002 || "—"}</td>
                          )}
                          {visibleCols.roll_2025 && (
                            <td>{m.roll_no_2025 || "—"}</td>
                          )}
                          {visibleCols.ward && <td>{m.ward || "—"}</td>}
                          {visibleCols.family && ( <td> {families.find((f) => f.id === m.family) ?.family_name_en || "—"} </td> )} 
                          {visibleCols.family_common && ( <td>{m.family_name_common || "—"}</td> )}
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                  {/* PAGINATION */}
<div className="d-flex justify-content-between align-items-center mt-3">
  <div>
    {Array.from({ length: totalPages }, (_, i) => i + 1)
      .slice(Math.max(currentPage - 3, 0), currentPage + 2)
      .map((p) => (
        <Button
          key={p}
          size="sm"
          className="me-1"
          variant={p === currentPage ? "primary" : "outline-secondary"}
          onClick={() => setCurrentPage(p)}
        >
          {p}
        </Button>
      ))}
  </div>

  <select
    className="form-select form-select-sm"
    style={{ width: 130 }}
    value={itemsPerPage}
    onChange={(e) => {
      setItemsPerPage(Number(e.target.value));
      setCurrentPage(1);
    }}
  >
    {[25, 50, 100, 200, 500].map((n) => (
      <option key={n} value={n}>
        {n} / page
      </option>
    ))}
  </select>
</div>

                </>
                
              )}

              <Button className="mt-3" variant="success" onClick={exportToExcel}>
                📥 Export to Excel
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* COLUMN SETTINGS MODAL */}
      <Modal
        show={showColumnSettings}
        onHide={() => setShowColumnSettings(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Show / Hide Columns</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Row>
            {columns.map((col) => (
              <Col md={6} key={col.key} className="mb-2">
                <label className="d-flex gap-2">
                  <input
                    type="checkbox"
                    checked={tempCols[col.key]}
                    onChange={() =>
                      setTempCols((p) => ({
                        ...p,
                        [col.key]: !p[col.key],
                      }))
                    }
                  />
                  {col.label}
                </label>
              </Col>
            ))}
          </Row>
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={() => setShowColumnSettings(false)}>Close</Button>
          <Button
            variant="primary"
            onClick={() => {
              setVisibleCols(tempCols);
              localStorage.setItem(
                "voters_visible_columns",
                JSON.stringify(tempCols)
              );
              setShowColumnSettings(false);
            }}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      <ViewMember
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        member={selectedMember}
      />
    </>
  );
};

export default VotersList;
