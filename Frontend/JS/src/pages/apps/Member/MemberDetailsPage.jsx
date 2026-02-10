import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button, Spinner } from "react-bootstrap";
import ViewMember from "./ViewMember";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const MemberDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wards, setWards] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const memberRes = await axios.get(
          `${API_BASE_URL}/api/members/${id}/`
        );
        setMember(memberRes.data);

        const wardRes = await axios.get(
          `${API_BASE_URL}/api/wards/`
        );
        setWards(wardRes.data);

      } catch (err) {
        console.error("Failed to load member", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading)
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
      </div>
    );

  return (
    <div className="container mt-4">

      {/* 🔙 Back button */}
      <Button
        variant="outline-secondary"
        className="mb-3"
        onClick={() => navigate(-1)}
      >
        ← Back
      </Button>

      {/* ♻️ reuse ViewMember */}
      <ViewMember
        isOpen={true}     // always open
        onClose={() => {}}
        member={member}
        wards={wards}
      />
    </div>
  );
};

export default MemberDetailsPage;
