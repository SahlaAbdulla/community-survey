import React, { useEffect, useState } from "react";
import { Table, Row, Col, Card, Button } from "react-bootstrap";
import axios from "axios";

const EducationReport = () => {
  const [summary, setSummary] = useState(null);
  const [houses, setHouses] = useState([]);

  useEffect(() => {
    axios
      .get("/api/education/report/")
      .then((res) => {
        setSummary(res.data.summary || null);
        setHouses(res.data.houses || []);
      })
      .catch((err) => console.error("Report fetch error:", err));
  }, []);

  return (
    <div>
      <h3 className="mb-3">📊 Education Reports</h3>

      {/* ✅ Summary Cards */}
      {summary && (
        <Row className="mb-4">
          <Col md={3}>
            <Card body className="bg-primary text-white shadow-sm">
              📚 Studying: <b>{summary.total_studying}</b>
            </Card>
          </Col>
          <Col md={3}>
            <Card body className="bg-danger text-white shadow-sm">
              ❌ Not Studying: <b>{summary.total_not_studying}</b>
            </Card>
          </Col>
          <Col md={3}>
            <Card body className="bg-success text-white shadow-sm">
              💼 Job: <b>{summary.total_job_yes}</b>
            </Card>
          </Col>
          <Col md={3}>
            <Card body className="bg-secondary text-white shadow-sm">
              🚫 No Job: <b>{summary.total_job_no}</b>
            </Card>
          </Col>
          <Col md={4} className="mt-3">
            <Card body className="bg-info text-dark shadow-sm">
              🏛 Govt Jobs: <b>{summary.total_govt_jobs}</b>
            </Card>
          </Col>
          <Col md={4} className="mt-3">
            <Card body className="bg-warning text-dark shadow-sm">
              🏢 Private Jobs: <b>{summary.total_private_jobs}</b>
            </Card>
          </Col>
          <Col md={4} className="mt-3">
            <Card body className="bg-dark text-white shadow-sm">
              🌍 Abroad Jobs: <b>{summary.total_abroad_jobs}</b>
            </Card>
          </Col>
        </Row>
      )}

      {/* ✅ House Report */}
      <h5>🏠 House-wise Education Report</h5>
      <Table striped bordered hover responsive>
        <thead className="table-dark">
          <tr>
            <th>🏠 House</th>
            <th>📚 Studying</th>
            <th>❌ Not Studying</th>
            <th>💼 Job</th>
            <th>🚫 No Job</th>
            <th>🏛 Govt</th>
            <th>🏢 Private</th>
            <th>🌍 Abroad</th>
          </tr>
        </thead>
        <tbody>
          {houses.map((h, idx) => (
            <tr key={idx}>
              <td>{h.house}</td>
              <td>{h.studying}</td>
              <td>{h.not_studying}</td>
              <td>{h.job_yes}</td>
              <td>{h.job_no}</td>
              <td>{h.govt_jobs}</td>
              <td>{h.private_jobs}</td>
              <td>{h.abroad_jobs}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="mt-3 text-end">
        <Button variant="success" onClick={() => window.print()}>
          📄 Print / Save PDF
        </Button>
      </div>
    </div>
  );
};

export default EducationReport;
