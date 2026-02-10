import React, { useEffect, useState } from "react";
import { Row, Col, Card, Button, Table, Modal } from "react-bootstrap";
import PageTitle from "../../../components/PageTitle";
import AddEditMember from "./AddEditMember";
import AddHouseForm from "./AddHouseForm";
import ViewHouseForm from "./ViewHouseForm";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit, faEye,faPlus, faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import axios from "axios";
import "./HouseList.css";
import ViewClusterHouses from "./ViewClusterHouses"; // new component
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { useNavigate } from "react-router-dom";
import ViewHousePage from "../House/ViewHousePage"; 



import { toast } from "react-toastify";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const HouseList = () => {
  const currentUser = JSON.parse(localStorage.getItem("user"));
  currentUser.user_type === "Election"

  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [houseToDelete, setHouseToDelete] = useState(null);
  const [confirmHouseDelete, setConfirmHouseDelete] = useState(false);


  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const [showHouseModal, setShowHouseModal] = useState(false);
  const [selectedHouse, setSelectedHouse] = useState(null);
  

  const [showViewModal, setShowViewModal] = useState(false);
  const [viewHouse, setViewHouse] = useState(null);

  const [members, setMembers] = useState([]);
  const [families, setFamilies] = useState([]);

  const [clusters, setClusters] = useState([]);
  const [showClusterModal, setShowClusterModal] = useState(false);
  const [selectedCluster, setSelectedCluster] = useState(null);
  // 🏘 Cluster View Handling
  const [clusterId, setClusterId] = useState(null);
  const navigate = useNavigate();
  
  const [selectedClusters, setSelectedClusters] = useState([]); // ✅ added
  const [selectedRow, setSelectedRow] = useState(null);
  
  const [showCheckboxes, setShowCheckboxes] = useState(false);
const [selectedRows, setSelectedRows] = useState([]);



  const handleRightClick = (e, id) => {
  e.preventDefault(); // disable default context menu
  setShowCheckboxes(true); // show checkboxes when right-click happens

  setSelectedRows((prev) =>
    prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
  );
};

// 🔑 decide mode automatically
const isBulkClusterUpdate = selectedRows.length > 0;




  




 useEffect(() => {
  (async () => {
    try {
      const [housesRes, membersRes, familiesRes, clustersRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/houses/`),
        axios.get(`${API_BASE_URL}/api/members/`),
        axios.get(`${API_BASE_URL}/api/families/`),
        axios.get(`${API_BASE_URL}/api/clusters/`),
      ]);

      setHouses(housesRes.data);
      setMembers(membersRes.data);
      setFamilies(familiesRes.data);
      setClusters(clustersRes.data); // ✅ now works properly
    } catch (e) {
      console.error("Error fetching data", e);
    } finally {
      setLoading(false);
    }
  })();
}, []);


  const handleViewCluster = (id) => {
  setClusterId(id);
  setShowClusterModal(true);
};

// 🟩 EXPORT FUNCTION
  const exportToExcel = () => {
    if (!houses.length) return;

    // Format all houses for Excel
    const exportData = houses.map((h, index) => ({
      "#": index + 1,
      "House Number": h.h_no
        ? `${h.h_no}${h.sub ? " " + h.sub.toUpperCase() : ""}`
        : "",
      "Family Name": h.family_name_en || "",
      "Owner": h.owner_en || "",
      
     
     
      "Cluster": h.cluster?.name_english || "",
     
      "Phone Number": h.phone_no || "",
      "Address": h.h_address || "",
      "House Type": h.h_type || "",
      "Road Access": h.road_access_type || "",
      "Water Source": h.w_source || "",
      "Gas Connection": h.g_connection ? "Yes" : "No",
      "Biogas": h.biogas ? "Yes" : "No",
      "Solar": h.solar ? "Yes" : "No",
      "Electricity": h.h_electricity ? "Yes" : "No",
      "Refrigerator": h.h_refrigerator ? "Yes" : "No",
      "Washing Machine": h.h_washing_machine ? "Yes" : "No",
      "Waste Disposal": h.waste_disposal_method || "",
      "Toilet": h.h_toilet ? "Yes" : "No",
      "Agriculture": h.h_agriculture ? "Yes" : "No",
      "Agriculture Type": h.agriculture_type || "",
      "Livestock": h.h_livestock ? "Yes" : "No",
      "Livestock Type": h.livestock_type || "",
      "Livestock Count": h.livestock_count || "",
      "Ration Card": h.ration_card ? "Yes" : "No",
      "Ration Card Number": h.ration_card_number || "",
      "Ration Card Category": h.ration_card_category || "",
    }));

    // Convert JSON → Excel Sheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "All Houses");

    // Save Excel File
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const file = new Blob([buffer], { type: "application/octet-stream" });
    saveAs(file, "All_Houses_Details.xlsx");
  };



  // ✅ House CRUD
  const handleAddHouse = async (house) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/houses/`, house);
      setHouses((prev) => [...prev, response.data]);
      toast.success("🏠 House added successfully!");
      setShowHouseModal(false);
      setSelectedHouse(null);
    } catch (error) {
      toast.error("❌ Failed to add house!");
      console.error("❌ Error adding house:", error);
    }
  };

  const handleUpdateHouse = async (house) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/houses/${house.id}/`,
        house
      );
      setHouses((prev) =>
        prev.map((h) => (h.id === house.id ? response.data : h))
      );
      toast.success("✅ House updated successfully!");
      setShowHouseModal(false);
      setSelectedHouse(null);
    } catch (error) {
      toast.error("❌ Failed to update house!");
      console.error("Error updating house:", error);
    }
  };

  const handleRemoveHouse = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/houses/${id}/`);
      setHouses((prev) => prev.filter((h) => h.id !== id));
      toast.success("🗑️ House deleted successfully!");
    } catch (error) {
      toast.error("❌ Error deleting house!");
      console.error("❌ Error deleting house:", error);
    }
  };

  // ✅ Member CRUD
  const handleAddMember = async (member) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/members/`, member);
      setMembers((prev) => [...prev, response.data]);
      toast.success("👤 Member added successfully!");
      setShowMemberModal(false);
      setSelectedMember(null);
    } catch (error) {
      toast.error("❌ Failed to add member!");
      console.error("❌ Error adding member:", error);
    }
  };

  const handleUpdateMember = async (member) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/members/${member.id}/`,
        member
      );
      setMembers((prev) =>
        prev.map((m) => (m.id === member.id ? response.data : m))
      );
      toast.success("👤 Member updated successfully!");
      setShowMemberModal(false);
      setSelectedMember(null);
    } catch (error) {
      toast.error("❌ Failed to update member!");
      console.error("❌ Error updating member:", error);
    }
  };

  const handleView = (house) => {
    setViewHouse(house);
    setShowViewModal(true);
  };

  const handleViewPage = (house) => {
  navigate(`/view-house/${house.id}`);
};


  // ✅ Filtered Houses (search)
  // ✅ Filtered Houses (Prefix-based search)
const filteredHouses = houses.filter((h) => {
  const family = families.find((f) => f.id === h.family);

  // Combine all searchable fields
  const combinedText = [
    h.owner_en,
    h.owner_ml,
    family?.family_name_en,
    family?.family_name_ml,
    h.h_no,
    h.sub,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .trim();

  const search = searchTerm.toLowerCase().trim();

  // Match only if any field starts with the search term
  return (
    h.owner_en?.toLowerCase().startsWith(search) ||
    h.owner_ml?.toLowerCase().startsWith(search) ||
    family?.family_name_en?.toLowerCase().startsWith(search) ||
    family?.family_name_ml?.toLowerCase().startsWith(search) ||
    h.h_no?.toLowerCase().startsWith(search) ||
    h.sub?.toLowerCase().startsWith(search)
  );
});


  // Pagination setup
const [currentPage, setCurrentPage] = useState(1);
const housesPerPage = 20;

const indexOfLastHouse = currentPage * housesPerPage;
const indexOfFirstHouse = indexOfLastHouse - housesPerPage;
const currentHouses = filteredHouses.slice(indexOfFirstHouse, indexOfLastHouse);
const totalPages = Math.ceil(filteredHouses.length / housesPerPage);

const nextPage = () => {
  if (currentPage < totalPages) setCurrentPage(currentPage + 1);
};

const prevPage = () => {
  if (currentPage > 1) setCurrentPage(currentPage - 1);
};

const handleExcelImport = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const reader = new FileReader();

    reader.onload = async (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      const jsonData = XLSX.utils.sheet_to_json(sheet);

      console.log("Excel Data:", jsonData);

      // 🟩 Loop each row & save to backend
      for (const row of jsonData) {
        const newHouse = {
          owner_en: row["Owner "] || "",
          owner_ml: row["Owner (ML)"] || "",
          family_name_en: row["Family "] || "",
          family_name_ml: row["Family (ML)"] || "",
          h_no: row["House Number"] || "",
          phone_no: row["Phone Number"] || "",
          h_address: row["Address"] || "",
          h_type: row["House Type"] || "",
        };

        await axios.post(`${API_BASE_URL}/api/houses/`, newHouse);
      }

      toast.success("📥 Excel Imported Successfully!");

      // Refresh houses
      const housesRes = await axios.get(`${API_BASE_URL}/api/houses/`);
      setHouses(housesRes.data);
    };

    reader.readAsArrayBuffer(file);
  } catch (error) {
    console.error("Import error:", error);
    toast.error("❌ Import failed!");
  }
};

const updateHouse = async (updatedData) => {
  try {
    const res = await axios.put(
      `${API_BASE_URL}/api/houses/${selectedHouse.id}/`,
      updatedData
    );

    toast.success("House updated successfully");

    // ✅ UPDATE HOUSE LIST
    setHouses((prev) =>
      prev.map((h) =>
        h.id === res.data.id ? res.data : h
      )
    );

    setSelectedHouse(null);
    setShowHouseModal(false);
  } catch (err) {
    toast.error("Failed to update house");
    console.error(err);
  }
};






  return (
    <>
      <PageTitle title="Houses" />

      <Row>
        <Col>
          <Card>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="header-title">All Houses</h4>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <input
                    type="text"
                    placeholder="🔍 Search by owner, family, or house no..."
                    className="form-control"
                    style={{ width: "250px" }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                              <Button onClick={() => navigate("/members/add")}>
                    + Add Member
                  </Button>
                  <Button
  variant="primary"
  onClick={() => navigate("/apps/house/add")}
>
  + Add House
</Button>

<Button
  variant="primary"
  onClick={() => {
    setShowClusterModal(true);  // always open modal
  }}
>
  Manage Cluster
</Button>





                </div>
              </div>

              {loading ? (
  <p>Loading...</p>
) : (
  <>
  {showCheckboxes && (
  <Button
    variant="secondary"
    size="sm"
    className="mb-2"
    onClick={() => {
      setShowCheckboxes(false);
      setSelectedRows([]);
    }}
  >
    Cancel Selection
  </Button>
)}

    <Table striped bordered hover responsive>
      <thead>
        <tr>
          <th>#</th>
          
        <th>
  Head of House
</th>

          <th>Family</th>
          <th>House Number</th>
           {/* ✅ SHOW EXTRA FIELDS ONLY IF ELECTION LOGIN */}
    {(currentUser?.department === "Election" || currentUser?.user_type === "Super Admin") && (
      <>
        <th>Cluster</th>
        <th>Total Members</th>
        <th>Total Voters</th>

      </>
    )}
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
  {currentHouses.length > 0 ? (
    currentHouses.map((h, index) => {
      const family = families.find((f) => f.id === h.family);
      const rowNumber = indexOfFirstHouse + index + 1;

      return (
        <tr
          key={h.id}
          onContextMenu={(e) => handleRightClick(e, h.id)} // ✅ Right-click activates checkbox
          onClick={() => handleViewPage(h)}                // normal click → navigate
          style={{ cursor: "context-menu" }}
          className="house-row"
        >
          {/* ✅ First cell (# column) */}
          <td style={{ textAlign: "center" }}>
  {showCheckboxes ? (
    <input
      type="checkbox"
      checked={selectedRows.includes(h.id)}
      onChange={() =>
        setSelectedRows((prev) =>
          prev.includes(h.id)
            ? prev.filter((x) => x !== h.id)
            : [...prev, h.id]
        )
      }
    />
  ) : (
    rowNumber
  )}
</td>

<td>{h.owner_en}</td>
<td>
  {family
    ? `${family.family_name_en || ""} / ${family.family_name_ml || ""}`
    : "-"
  }
</td>
<td>{h.h_no}{h.sub ? `/ ${h.sub}` : ""}</td>

{/* ✅ Election specific fields */}
{(currentUser?.department === "Election" || currentUser?.user_type === "Super Admin") && (
  <>
   <td>{h.cluster?.name_malayalam || "-"}</td>
    <td>{h.total_members || 0}</td>
    <td>{h.total_voters || 0}</td>
  </>
)}


<td>
  {currentUser?.department === "Election" ? (
    <>
      {/* ✅ Election login → ONLY EDIT + DELETE */}

      <Button
        variant="warning"
        size="sm"
        className="me-2"
        onClick={(e) => {
          e.stopPropagation();
          setSelectedHouse(h);
          setShowHouseModal(true);
        }}
      >
        <FontAwesomeIcon icon={faEdit} />
      </Button>

      <Button
        variant="danger"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          setHouseToDelete(h);
          setShowDeleteModal(true);
        }}
      >
        <FontAwesomeIcon icon={faTrash} />
      </Button>
    </>
  ) : (
    <>
      {/* ✅ Normal login → SHOW ALL BUTTONS */}

      <Button
  variant="info"
  size="sm"
  className="me-2"
  onClick={(e) => {
    e.stopPropagation();
    handleView(h);   // ✅ This opens the View Modal
  }}
>
  <FontAwesomeIcon icon={faEye} />
</Button>


      <Button
  variant="warning"
  size="sm"
  onClick={(e) => {
  e.stopPropagation();

  setSelectedHouse({
    ...h,
    cluster: h.cluster?.id || h.cluster, // ✅ IMPORTANT FIX
  });

  setShowHouseModal(true);
}}

>
  <FontAwesomeIcon icon={faEdit} />
</Button>


      <Button
        variant="danger"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          setHouseToDelete(h);
          setShowDeleteModal(true);
        }}
      >
        <FontAwesomeIcon icon={faTrash} />
      </Button>
    </>
  )}
</td>

        </tr>
      );
    })
  ) : (
    <tr>
      <td colSpan="8" className="text-center">
        No houses found.
      </td>
    </tr>
  )}
</tbody>

    </Table>

    {/* Pagination Controls */}
{/* Pagination Controls */}
<div className="pagination-wrapper mt-4">
  {filteredHouses.length > 20 && (
    [...Array(totalPages)].map((_, i) => (
      <button
        key={i}
        className={`page-btn ${currentPage === i + 1 ? "active" : ""}`}
        onClick={() => setCurrentPage(i + 1)}
      >
        {i + 1}
      </button>
    ))
  )}
</div>





  </>
)}

<Button variant="success" className="me-2" onClick={exportToExcel}>
            📥 
          </Button>

          <input
  type="file"
  id="excelUpload"
  accept=".xlsx, .xls"
  style={{ display: "none" }}
  onChange={handleExcelImport}
/>

{/* <Button
  variant="success"
  onClick={() => document.getElementById("excelUpload").click()}
>
  📤 Import Excel
</Button> */}



            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Member Modal */}
      {/* <AddEditMember
        isOpen={showMemberModal}
        onClose={() => setShowMemberModal(false)}
        onAddMember={handleAddMember}
        onUpdateMember={handleUpdateMember}
        memberData={selectedMember}
        isEditable={!!selectedMember}
        families={families}
      /> */}

<Modal
  show={showHouseModal}
  onHide={() => {
    setShowHouseModal(false);
    setSelectedHouse(null);
  }}
  size="xl"
  centered
  backdrop="static"
  scrollable
>
  {/* <Modal.Header closeButton>
    <Modal.Title>Edit House</Modal.Title>
  </Modal.Header> */}

  <Modal.Body>
    <AddHouseForm
      isOpen={showHouseModal}          // ✅ VERY IMPORTANT
      isEditable={true}
      houseData={selectedHouse}
      families={families}
      clusters={clusters}
      showBackButton={false}
      onUpdateHouse={updateHouse}      // ✅ CORRECT PLACE
      onClose={() => {
        setShowHouseModal(false);
        setSelectedHouse(null);
      }}
    />
  </Modal.Body>
</Modal>




      {/* View Modal */}
      {viewHouse && (
        <ViewHouseForm
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          houseData={viewHouse}
        />
      )}
      {/* 🏘 Cluster-wise House List Modal */}
{/* 🏘 Cluster List + View Modal */}
<Modal
  show={showClusterModal}
  onHide={() => {
    setShowClusterModal(false);
    setSelectedCluster(null);
  }}
  size="lg"
>
  <Modal.Header closeButton>
    <Modal.Title>🏘 Manage Cluster</Modal.Title>
  </Modal.Header>

  <Modal.Body>

    {/* =====================================================
        🟩 BULK UPDATE MODE (houses selected)
       ===================================================== */}
    {isBulkClusterUpdate && (
      <>
        <h5 className="fw-bold mb-3">Select Cluster</h5>

        <Table bordered hover responsive>
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Cluster Name (English)</th>
              <th>Cluster Name (Malayalam)</th>
            </tr>
          </thead>
          <tbody>
            {clusters.map((c, index) => {
              const isSelected = selectedCluster?.id === c.id;
              return (
                <tr
                  key={c.id}
                  onClick={() => setSelectedCluster(c)}
                  style={{
                    cursor: "pointer",
                    backgroundColor: isSelected ? "#e7f9f7" : "transparent",
                  }}
                >
                  <td>{index + 1}</td>
                  <td>{c.name_english}</td>
                  <td className="d-flex justify-content-between align-items-center">
                    <span>{c.name_malayalam}</span>
                    {isSelected && (
                      <input type="checkbox" checked readOnly />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>

        {/* ACTION BUTTONS */}
        {selectedCluster && (
          <div className="text-center mt-4">
            <div className="d-flex justify-content-center gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowClusterModal(false);
                  setSelectedCluster(null);
                  setShowCheckboxes(false);
                  setSelectedRows([]);
                }}
              >
                ✖ Cancel
              </Button>

              <Button
                variant="success"
                onClick={async () => {
                  try {
                    await axios.put(
                      `${API_BASE_URL}/api/houses/update-cluster/`,
                      {
                        house_ids: selectedRows,
                        cluster_id: selectedCluster.id,
                      }
                    );

                    toast.success("✅ Cluster updated successfully!");

                    const housesRes = await axios.get(
                      `${API_BASE_URL}/api/houses/`
                    );
                    setHouses(housesRes.data);

                    setShowClusterModal(false);
                    setSelectedCluster(null);
                    setShowCheckboxes(false);
                    setSelectedRows([]);
                  } catch (err) {
                    console.error(err);
                    toast.error("❌ Failed to update cluster");
                  }
                }}
              >
                💾 Save
              </Button>
            </div>
          </div>
        )}
      </>
    )}

    {/* =====================================================
        🟦 VIEW MODE (no house selected)
       ===================================================== */}
    {!isBulkClusterUpdate && (
      <>
        <div className="mb-3">
          <label className="form-label fw-bold">
            Select Cluster:
          </label>
          <select
            className="form-select"
            value={selectedCluster?.id || ""}
            onChange={(e) => {
              const cluster = clusters.find(
                (c) => c.id === Number(e.target.value)
              );
              setSelectedCluster(cluster);
            }}
          >
            <option value="">-- Select Cluster --</option>
            {clusters.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name_english} / {c.name_malayalam}
              </option>
            ))}
          </select>
        </div>

        {selectedCluster ? (
          <ViewClusterHouses clusterId={selectedCluster.id} />
        ) : (
          <div className="text-center text-muted mt-4">
            Please select a cluster to view houses.
          </div>
        )}
      </>
    )}

  </Modal.Body>
</Modal>





      {/* Delete Confirmation Modal */}
      {/* 🏠 House Delete Confirmation Modal */}
<Modal
  show={showDeleteModal}
  onHide={() => {
    setShowDeleteModal(false);
    setConfirmHouseDelete(false);
  }}
  centered
>
  <Modal.Header closeButton>
    <Modal.Title>Confirm Delete</Modal.Title>
  </Modal.Header>

  <Modal.Body>
    {confirmHouseDelete ? (
      <div className="text-danger">
        ⚠️ Are you absolutely sure you want to delete{" "}
        <b>{houseToDelete?.owner_en || "this house"}</b>?
      </div>
    ) : (
      <>
        Are you sure you want to delete{" "}
        <b>{houseToDelete?.owner_en || "this house"}</b>?
      </>
    )}
  </Modal.Body>

  <Modal.Footer>
    <Button
      variant="secondary"
      onClick={() => {
        setShowDeleteModal(false);
        setConfirmHouseDelete(false);
      }}
    >
      Cancel
    </Button>

    <Button
      variant={confirmHouseDelete ? "danger" : "outline-danger"}
      onClick={async () => {
        if (!confirmHouseDelete) {
          // First click — show confirmation
          setConfirmHouseDelete(true);
        } else {
          // Second click — actually delete
          await handleRemoveHouse(houseToDelete.id);
          setShowDeleteModal(false);
          setConfirmHouseDelete(false);
        }
      }}
    >
      {confirmHouseDelete ? "Confirm Delete" : "Delete"}
    </Button>
  </Modal.Footer>
</Modal>
 

    </>
    
  );
};

export default HouseList;
