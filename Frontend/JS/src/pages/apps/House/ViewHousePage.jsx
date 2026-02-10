import { useParams } from "react-router-dom";
import axios from "axios";
import React, { useEffect, useState } from "react";
import View from "./View";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ViewHousePage = () => {
  const { id } = useParams(); // ✅ THIS IS HOUSE ID
  const [house, setHouse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHouse = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${API_BASE_URL}/api/houses/${id}/`
        );
        setHouse(res.data);
      } catch (err) {
        console.error("House fetch error:", err);
        setHouse(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchHouse();
  }, [id]); // 🔥 KEY FIX

  if (loading) {
    return <p className="text-center mt-5">Loading...</p>;
  }

  if (!house) {
    return (
      <p className="text-center mt-5 text-danger">
        House not found
      </p>
    );
  }

  return (
    <div className="container-fluid mt-4">
      <View houseData={house} />
    </div>
  );
};

export default ViewHousePage;
