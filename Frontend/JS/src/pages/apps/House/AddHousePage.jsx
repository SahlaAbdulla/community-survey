import React, { useEffect, useState } from "react";
import axios from "axios";
import AddHouseForm from "../House/AddHouseForm";
import { toast } from "react-toastify";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AddHousePage = () => {
    console.log("🔥 AddHousePage mounted");
  const [families, setFamilies] = useState([]);
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleAddHouse = async (houseData) => {
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/houses/`,
        houseData
      );

      toast.success("🏠 House added successfully");
      console.log("✅ House saved:", res.data);
    } catch (err) {
      console.error("❌ Failed to add house", err);
      toast.error("Failed to add house");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [famRes, houseRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/families/`),
          axios.get(`${API_BASE_URL}/api/houses/`),
        ]);

        setFamilies(famRes.data);
        setHouses(houseRes.data);
      } catch (err) {
        console.error("Failed to load families/houses", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <p className="text-center mt-5">Loading data…</p>;
  }

  return (
    <AddHouseForm
      isOpen={true}
      isEditable={false}
      families={families}
      houses={houses}
      onAddHouse={handleAddHouse} 
    />
  );
};

export default AddHousePage;
