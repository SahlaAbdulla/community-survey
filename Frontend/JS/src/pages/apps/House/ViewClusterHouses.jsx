import React, { useEffect, useState } from "react";
import { Table, Spinner, Alert } from "react-bootstrap";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ViewClusterHouses = ({ clusterId, onClose }) => {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  

  useEffect(() => {
    if (!clusterId) return;

    setLoading(true);
    setError(null);

    axios
  .get(`${API_BASE_URL}/api/houses/?cluster=${clusterId}`)
  .then((res) => {
    console.log("Fetched cluster houses response:", res.data);
    const data = Array.isArray(res.data)
      ? res.data
      : res.data?.results || res.data?.data || [];
    setHouses(data);
  })
      .catch((err) => {
        console.error("Error fetching cluster houses:", err);
        setError("Failed to load cluster houses.");
      })
      .finally(() => setLoading(false));
  }, [clusterId]);

  if (loading)
    return (
      <div className="text-center my-3">
        <Spinner animation="border" />
        <div>Loading cluster houses...</div>
      </div>
    );

  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Table bordered hover responsive>
      <thead className="table-light">
        <tr>
          <th>#</th>
          <th>Owner (EN)</th>
          <th>Owner (ML)</th>
          <th>Family</th>
          <th>House Number</th>
        </tr>
      </thead>
      <tbody>
        {houses.length > 0 ? (
          houses.map((house, index) => (
            <tr key={house.id}>
              <td>{index + 1}</td>
              <td>{house.owner_en}</td>
              <td>{house.owner_ml}</td>
              <td>
                {house.family_name_en} / {house.family_name_ml}
              </td>
              <td>{house.h_no}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="5" className="text-center text-muted">
              No houses found in this cluster.
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  );
};

export default ViewClusterHouses;
