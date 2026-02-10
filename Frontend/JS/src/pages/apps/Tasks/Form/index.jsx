import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Table, Button, Spinner } from "react-bootstrap";
import PageTitle from "@/components/PageTitle";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const VotersFormList = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Pagination states (same as VotersList)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  const navigate = useNavigate();

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/members/`);
      setMembers(res.data);
    } catch (err) {
      console.error("Error fetching members:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ===================== PAGINATION ===================== */
  const filteredMembers = members.filter(
  (m) =>
    (m.roll_no_ceo && String(m.roll_no_ceo).trim() !== "") ||
    (m.epic_id && String(m.epic_id).trim() !== "")
);

const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);

const paginatedMembers = filteredMembers.slice(
  (currentPage - 1) * itemsPerPage,
  currentPage * itemsPerPage
);

  /* ===================== EXCEL ===================== */
  const exportToExcel = () => {
    const data = members.map((m, i) => ({
      "#": i + 1,
      Name: m.m_name_en || "",
      "Roll-ECI": m.roll_no_ceo || "",
      "EPIC ID": m.epic_id || "",
      "2002": m.has_2002 ? "YES" : "",
      "2025": m.roll_no_2025 || "",
      "D.SIR": m.d_sir ? "YES" : "",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Form List");
    XLSX.writeFile(wb, "voters_form_list.xlsx");
  };

  return (
    <>
      <PageTitle title="SIR LIST" />

      <Card>
        <Card.Body>
          {/* HEADER */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">List</h5>
            <div className="d-flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => window.print()}
              >
                🖨 Print
              </Button>
              <Button size="sm" variant="success" onClick={exportToExcel}>
                📥 Excel
              </Button>
            </div>
          </div>

          {/* TABLE */}
          {loading ? (
            <div className="text-center py-5">
              <Spinner />
            </div>
          ) : (
            <>
              <Table bordered size="sm" className="text-left">
                <thead className="table-light">
                  <tr>
    <th>#</th>
    <th>Name (ML)</th>
    <th>Guardian Name (ML)</th>
    <th>Family Name (ML)</th>
    <th>House No</th>
    <th>Age</th>
    <th>Gender</th>
    <th>Roll No-ECI</th>
    <th>EPIC ID</th>
    <th>Roll No-SEC</th>
    <th>Polling Booth</th>
  </tr>
                </thead>

                <tbody>
  {paginatedMembers.map((m, index) => (
    <tr key={m.id}>
      {/* Serial number */}
      <td>
        {(currentPage - 1) * itemsPerPage + index + 1}
      </td>

      {/* ✅ NAME (ML) – CLICKABLE */}
      <td
        onClick={() => navigate(`/members/${m.id}`)}
        style={{
          cursor: "pointer",
          color: "black",
          fontWeight: 500,
        }}
      >
        {m.m_name_ml || "—"}
      </td>

      {/* Guardian ML */}
      <td>{m.guardian_ml || "—"}</td>

      {/* Family Name ML */}
      <td>{m.family_name_ml || "—"}</td>

      {/* House No */}
      <td>
        {m.h_no
          ? m.sub
            ? `${m.h_no}/${m.sub}`
            : m.h_no
          : "—"}
      </td>

      {/* Age */}
      <td>{m.m_age || "—"}</td>

      {/* Gender */}
      <td>{m.m_gender || "—"}</td>

      {/* Roll No-ECI */}
      <td>{m.roll_no_ceo || "—"}</td>

      {/* EPIC ID */}
      <td>{m.epic_id || "—"}</td>

      {/* Roll No-SEC */}
      <td>{m.roll_no_sec || "—"}</td>

      {/* Polling Booth */}
      <td>{m.polling_booth_no || "—"}</td>
    </tr>
  ))}
</tbody>
              </Table>

              {/* ✅ SAME PAGINATION STYLE AS VotersList */}
              <div className="d-flex justify-content-between align-items-center mt-3">
                {/* Page numbers */}
                <div>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .slice(Math.max(currentPage - 3, 0), currentPage + 2)
                    .map((p) => (
                      <Button
                        key={p}
                        size="sm"
                        className="me-1"
                        variant={
                          p === currentPage
                            ? "primary"
                            : "outline-secondary"
                        }
                        onClick={() => setCurrentPage(p)}
                      >
                        {p}
                      </Button>
                    ))}
                </div>

                {/* Rows per page */}
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
        </Card.Body>
      </Card>

      {/* PRINT STYLE */}
      <style>
        {`
          @media print {
            button, select {
              display: none !important;
            }
            body {
              font-size: 12px;
            }
          }
        `}
      </style>
    </>
  );
};

export default VotersFormList;
