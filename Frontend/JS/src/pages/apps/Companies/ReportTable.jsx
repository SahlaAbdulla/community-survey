import React, { useState } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Table,
  Form,
  InputGroup,
} from "react-bootstrap";

const ReportTable = ({ data, columns, title, totals }) => {
  const [filteredData, setFilteredData] = useState(data);

  const onSearch = (value) => {
    if (!value) {
      setFilteredData(data);
    } else {
      const lowerVal = value.toLowerCase();
      setFilteredData(
        data.filter((row) =>
          Object.values(row).some(
            (cell) =>
              cell &&
              cell.toString().toLowerCase().includes(lowerVal)
          )
        )
      );
    }
  };

  return (
    <div className="mt-4">

      {/* ✅ Summary Stat Cards */}
     

      {/* ✅ Header */}
      <Card className="shadow-sm border-0 mb-3">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={6}>
              <h4 className="fw-bold text-primary m-0">
                📊 {title}
              </h4>
            </Col>
            <Col md={6} className="text-md-end mt-3 mt-md-0">
              <InputGroup>
                <Form.Control
                  type="search"
                  placeholder={`Search in ${title}...`}
                  onChange={(e) => onSearch(e.target.value)}
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setFilteredData(data)}
                >
                  Reset
                </Button>
                <Button
                  variant="primary"
                  onClick={() => window.print()}
                >
                  🖨 Print
                </Button>
              </InputGroup>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* ✅ Table */}
      <Card className="shadow border-0 rounded-3">
        <Card.Body>
          {filteredData.length === 0 ? (
            <p className="text-muted text-center py-4">
              No records found.
            </p>
          ) : (
            <Table
              striped
              hover
              responsive
              bordered
              className="align-middle text-center mb-0"
            >
              <thead className="table-primary">
                <tr>
                  <th style={{ width: "60px" }}>#</th>
                  {columns.map((col, i) => (
                    <th key={i}>{col.header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, index) => (
                  <tr key={index}>
                    <td className="fw-semibold">{index + 1}</td>
                    {columns.map((col, i) => (
                      <td key={i}>{row[col.accessor]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default ReportTable;
