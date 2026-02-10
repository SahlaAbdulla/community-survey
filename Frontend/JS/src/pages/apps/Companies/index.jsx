import React, { useEffect, useState } from "react";
import PageTitle from "../../../components/PageTitle";
import ReportTable from "./ReportTable";
import EducationReport from "./EducationReport";
import api from "../../../api/axios";
import { Row, Col, Card, Table } from "react-bootstrap";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const Reports = () => {
  const [reportData, setReportData] = useState(null);
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const isEducationAdmin =
    currentUser?.user_type === "Dept Admin" &&
    currentUser?.department === "Education";

  useEffect(() => {
    if (!isEducationAdmin) {
      api
        .get("/report/")
        .then((res) => setReportData(res.data))
        .catch((err) => console.error("Error fetching report:", err));
    }
  }, [isEducationAdmin]);

  // 🔹 Education Admin → show only EducationReport.js
  if (isEducationAdmin) {
    return <EducationReport />;
  }

  // 🔹 Normal user
  if (!reportData)
    return <p className="text-center mt-5">⏳ Loading report...</p>;

  const houseColumns = [
    { header: "Family Name", accessor: "family_name" },
    { header: "House No", accessor: "h_no" },
    { header: "Members", accessor: "member_count" },
  ];

  return (
    <>
      <PageTitle title={"Reports"} />

      {/* ✅ Summary Cards */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="p-4 text-center shadow-sm border-0 bg-primary text-white rounded-3">
            <h6 className="fw-semibold">🏠 Total Houses</h6>
            <h2 className="fw-bold">{reportData.house_count}</h2>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="p-4 text-center shadow-sm border-0 bg-success text-white rounded-3">
            <h6 className="fw-semibold">👨‍👩‍👧‍👦 Total Members</h6>
            <h2 className="fw-bold">{reportData.member_count}</h2>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="p-4 text-center shadow-sm border-0 bg-warning text-dark rounded-3">
            <h6 className="fw-semibold">👪 Total Families</h6>
            <h2 className="fw-bold">{reportData.family_count}</h2>
          </Card>
        </Col>
      </Row>

      {/* ✅ Houses Report */}
      <ReportTable
        data={reportData.houses}
        columns={houseColumns}
        title="Houses & Families Report"
      />

      {/* ✅ Education Report (Summary) */}
      {reportData.education_summary?.length > 0 && (
        <Card className="p-4 shadow-sm border-0 mb-4 rounded-3">
          <h5 className="text-center mb-4 fw-bold text-primary">
            📊 Education Report
          </h5>

          {/* Chart */}
          <div style={{ width: "100%", height: 350 }}>
            <ResponsiveContainer>
              <BarChart data={reportData.education_summary}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="passed" fill="#28a745" name="Passed" />
                <Bar dataKey="failed" fill="#dc3545" name="Failed" />
                <Bar dataKey="studying" fill="#007bff" name="Studying" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Table */}
          <Table
            striped
            bordered
            hover
            responsive
            className="mt-4 text-center align-middle shadow-sm"
          >
            <thead className="table-dark">
              <tr>
                <th>Education Level</th>
                <th>Passed</th>
                <th>Failed</th>
                <th>Studying</th>
              </tr>
            </thead>
            <tbody>
              {reportData.education_summary.map((row, idx) => (
                <tr key={idx}>
                  <td className="fw-semibold">{row.name}</td>
                  <td>{row.passed ?? ""}</td>
                  <td>{row.failed ?? ""}</td>
                  <td>{row.studying ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}
    </>
  );
};

export default Reports;
