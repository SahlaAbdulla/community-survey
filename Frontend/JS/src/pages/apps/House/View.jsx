import React, { useEffect, useState } from "react";
import { Row, Col, Button ,Modal} from "react-bootstrap";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faTimesCircle,faEdit } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import AddEditMember from "./AddEditMember"; 
import AddHouseForm from "./AddHouseForm";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ViewMember from "../Member/ViewMember";
import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";




const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;



// ✅ ICON helper
const yesNoIcon = (value) =>
  value ? (
    <FontAwesomeIcon icon={faCheckCircle} className="text-success ms-1" />
  ) : (
    <FontAwesomeIcon icon={faTimesCircle} className="text-danger ms-1" />
  );

const View = ({ houseData }) => {
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(true);

  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedHouseId, setSelectedHouseId] = useState(null);
  const [showEditHouseModal, setShowEditHouseModal] = useState(false);

  const [showAllMembersModal, setShowAllMembersModal] = useState(false);
const [allMembers, setAllMembers] = useState([]);
const [loadingAllMembers, setLoadingAllMembers] = useState(false);
const [searchTerm, setSearchTerm] = useState("");
const [selectedMemberId, setSelectedMemberId] = useState(null);
const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [showHouseModal, setShowHouseModal] = useState(false);
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [families, setFamilies] = useState([]);
  const [clusters, setClusters] = useState([]);


  const [showDeleteModal, setShowDeleteModal] = useState(false);
const [deleteMemberId, setDeleteMemberId] = useState(null);
const openDeleteModal = (id) => {
  setDeleteMemberId(id);
  setShowDeleteModal(true);
};
const [showViewMemberModal, setShowViewMemberModal] = useState(false);
const [selectedMember, setSelectedMember] = useState(null);
const [showReassignModal, setShowReassignModal] = useState(false);
const [reassignMember, setReassignMember] = useState(null);

const [membersToReassign, setMembersToReassign] = useState([]);
console.log("ALL MEMBERS SAMPLE:", allMembers.slice(0, 3));







  const navigate = useNavigate();

  const searchTermLower = searchTerm.toLowerCase().trim();

const filteredMembers = allMembers.filter((member) =>
  `${member.m_name_en || ""} ${member.family_name_en || ""} ${member.polling_booth_no || ""} ${member.h_no || ""}`
    .toLowerCase()
    .includes(searchTerm)
);

const updateHouse = async (updatedData) => {
  try {
    const res = await axios.put(
      `${API_BASE_URL}/api/houses/${selectedHouse.id}/`,
      updatedData
    );

    toast.success("House updated successfully");

    // ✅ update local displayed house
    setSelectedHouse(null);
    setShowHouseModal(false);

    // ✅ refresh page data (BEST OPTION)
    window.location.reload();

  } catch (err) {
    toast.error("Failed to update house");
    console.error(err);
  }
};


useEffect(() => {
  const fetchClusters = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/clusters/`);
      setClusters(res.data);
    } catch (err) {
      console.error("Failed to load clusters", err);
    }
  };

  fetchClusters();
}, []);





  if (!houseData) return <div>Loading...</div>;

  const InfoItem = ({ label, value }) => {
  const isIcon =
    React.isValidElement(value) && value.type === FontAwesomeIcon;

  return (

    
    <Col md={2} className="mb-3">

      
      <div
        style={{
          fontSize: "0.7rem",
          fontWeight: "bold",
          color: "black",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <span>{label}</span>
        {isIcon && value}
      </div>

      {!isIcon && (
        <div style={{ fontSize: "0.9rem", color: "#555" }}>
          {value || "N/A"}
        </div>
      )}
    </Col>
  );
};


  const fullHouseNo =
    houseData.h_no && houseData.sub
      ? `${houseData.h_no} ${houseData.sub.toUpperCase()}`
      : houseData.h_no || "";

  // ✅ GET house-based family members
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoadingMembers(true);

        if (!houseData.family) {
          setMembers([]);
          return;
        }

        const res = await axios.get(
  `${API_BASE_URL}/api/members?house=${houseData.id}`
);


        const result = res.data;
        const list = Array.isArray(result) ? result : result?.data || [];

        setMembers(list);
      } catch (error) {
        console.error("❌ Error loading members: ", error);
        setMembers([]);
      } finally {
        setLoadingMembers(false);
      }
    };

    fetchMembers();
  }, [houseData.family]);

  const fetchAllMembers = async () => {
  try {
    setLoadingAllMembers(true);
    const res = await axios.get(`${API_BASE_URL}/api/members`);
    setAllMembers(Array.isArray(res.data) ? res.data : res.data?.data || []);
  } catch (error) {
    console.error("❌ Error fetching all members:", error);
  } finally {
    setLoadingAllMembers(false);
  }
};

useEffect(() => {
  if (showAllMembersModal) {
    fetchAllMembers();
  }
}, [showAllMembersModal]);


 const assignMultipleMembers = async () => {
  try {
    for (let id of selectedMemberIds) {
      await axios.put(`${API_BASE_URL}/api/members/${id}/assign-house/`, {
        house_id: houseData.id,
      });
    }

    toast.success("Members added successfully!");

    // Refresh member list
    const res = await axios.get(
  `${API_BASE_URL}/api/members?house=${houseData.id}`
);


setMembers(Array.isArray(res.data) ? res.data : res.data?.data || []);

    setSelectedMemberIds([]);
    setShowAllMembersModal(false);

  } catch (error) {
    toast.error("Failed to add members!");
    console.error(error);
  }
};

useEffect(() => {
  const fetchFamilies = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/families/`);
      setFamilies(res.data);
    } catch (err) {
      console.error("Failed to load families", err);
    }
  };

  fetchFamilies();
}, []);

const confirmDeleteMember = async () => {
  try {
    await axios.put(
      `${API_BASE_URL}/api/members/${deleteMemberId}/`,
      { is_active_in_house: false }
    );

    toast.success("Member removed from household");

    // View page list-ൽ നിന്ന് hide
    setMembers((prev) =>
      prev.filter((m) => m.id !== deleteMemberId)
    );
  } catch (error) {
    toast.error("Failed to remove member");
  } finally {
    setShowDeleteModal(false);
    setDeleteMemberId(null);
  }
};

const confirmReassignMember = async () => {
  try {
    await axios.put(
      `${API_BASE_URL}/api/members/${reassignMember.id}/assign-house/`,
      {
        house_id: houseData.id,
        force_reassign: true, // backend supports it if needed
      }
    );

    toast.success("Member moved to this house successfully");

    // refresh current house members
    const res = await axios.get(
  `${API_BASE_URL}/api/members?house=${houseData.id}`
);

    setMembers(Array.isArray(res.data) ? res.data : res.data?.data || []);

    setShowReassignModal(false);
    setReassignMember(null);
    setSelectedMemberIds([]);
    setShowAllMembersModal(false);

  } catch (err) {
    toast.error("Failed to move member");
    console.error(err);
  }
};





  return (
    <div className="mt-3" style={{ backgroundColor: "#ffffff" }}>
      {/* ---------------- TOP HEADER ---------------- */}
      {/* ---------------- TOP HEADER ---------------- */}
      <div className="d-flex justify-content-start mb-2">
      <button
  className="btn btn-outline-secondary"
  style={{ marginLeft: "10px", marginTop: "10px" }}
  onClick={() => navigate(-1)}
>
  ← Back
</button>

    </div>
<div
  style={{
    backgroundColor: "#b9cbee",
    padding: "12px 0",
    fontSize: "1.4rem",
    fontWeight: "700",
    textAlign: "center",
    color: "grey",
    position: "relative",
  }}
>
  Household Details

  {/* ✅ Edit Button for Household Details */}
 <Button
  variant="warning"
  size="sm"
  className="me-2"
  style={{
    position: "absolute",
    right: "20px",
    top: "8px",
    fontSize: "0.9rem",
  }}
  onClick={() => {
    setSelectedHouse({
      ...houseData,
      cluster: houseData.cluster?.id || houseData.cluster,
    });
    setShowHouseModal(true);
  }}
>
  <FontAwesomeIcon icon={faEdit} />
</Button>

</div>


      {/* ---------------- HOUSE DETAILS ---------------- */}
      <div className="px-4 py-4 ">
        <Row>
          <InfoItem label="HEAD OF HOUSE" value={houseData.owner_en} />
          <InfoItem label="HOUSE NUMBER" value={fullHouseNo} />
          <InfoItem label="FAMILY NAME" value={houseData.family_name_en} />

          <InfoItem
            label="CLUSTER"
            value={
              houseData.cluster
                ? `${houseData.cluster.name_english} 
              `
                : "—"
            }
          />
          <InfoItem label="CONTACT NUMBER" value={houseData.phone_no} />
          <InfoItem label="ADDRESS" value={houseData.h_address} />

          <InfoItem label="HOUSE TYPE" value={houseData.h_type} />
          <InfoItem label="ROAD ACCESS" value={houseData.road_access_type} />
          <InfoItem label="WATER SOURCE" value={houseData.w_source} />
          <InfoItem label="GAS CONNECTION" value={yesNoIcon(houseData.g_connection)} />
          <InfoItem label="BIOGAS" value={yesNoIcon(houseData.biogas)} />
          <InfoItem label="SOLAR" value={yesNoIcon(houseData.solar)} />
          <InfoItem label="ELECTRICITY" value={yesNoIcon(houseData.h_electricity)} />
          <InfoItem label="REFRIGERATOR" value={yesNoIcon(houseData.h_refrigerator)} />
          <InfoItem label="WASHING MACHINE" value={yesNoIcon(houseData.h_washing_machine)} />
          <InfoItem label="WASTE DISPOSAL" value={houseData.waste_disposal_method} />

          <InfoItem label="TOILET" value={yesNoIcon(houseData.h_toilet)} />
          <InfoItem label="AGRICULTURE" value={yesNoIcon(houseData.h_agriculture)} />

          {houseData.h_agriculture && (
            <InfoItem label="AGRICULTURE TYPE" value={houseData.agriculture_type} />
          )}

          <InfoItem label="LIVESTOCK" value={yesNoIcon(houseData.h_livestock)} />

          {houseData.h_livestock && (
            <>
              <InfoItem label="LIVESTOCK TYPE" value={houseData.livestock_type} />
              <InfoItem label="LIVESTOCK COUNT" value={houseData.livestock_count} />
            </>
          )}

           {/* RATION CARD */}
{!houseData.ration_card && (
  <InfoItem
    label="RATION CARD"
    value={<FontAwesomeIcon icon={faTimesCircle} className="text-danger ms-1" />}
  />
)}

{houseData.ration_card && (
  <InfoItem
    label="RATION CARD"
    value={`${houseData.ration_card_number} - ${houseData.ration_card_category}`}
  />
)}

          {/* {houseData.ration_card && (
            <>
              <InfoItem label="RATION CARD NUMBER" value={houseData.ration_card_number} />
              <InfoItem label="RATION CARD CATEGORY" value={houseData.ration_card_category} />
            </>
          )} */}
        </Row>
      </div>

      {/* ---------------- FAMILY MEMBERS TABLE ---------------- */}
      <div className="mt-5">
        <h5 className="text-center" style={{ fontWeight: "700", color: "#002b65" }}>
          {houseData.family_name_en} – {houseData.owner_en}  Family Members
        </h5>

        <div className="d-flex justify-content-center mb-3">
        <button
  className="btn btn-primary me-2"
  onClick={() => {
    setShowAllMembersModal(true);
  }}
>
  Add Member to Household
</button>

          <button
   className="btn btn-secondary"
   onClick={() => {
     setSelectedHouseId(houseData.id);
     setShowAddMemberModal(true);
   }}
 >
   Add New Member
 </button>
        </div>

        <div className="table-responsive">
          <table className="table table-bordered table-striped">
            <thead className="table-primary text-center">
              <tr>
                <th>Sl.No</th>
                <th>Name</th>
                <th>Gender</th>
                <th>Booth No</th>
                <th>House No</th>
                <th>House Name</th>
                <th>Age</th>
                <th>Action</th>
               
              </tr>
            </thead>

            <tbody>
              {loadingMembers ? (
                <tr>
                  <td colSpan="8" className="text-center text-muted">
                    Loading members...
                  </td>
                </tr>
              ) : members.length > 0 ? (
                members.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                  <td
  style={{ cursor: "pointer", color: "black"}}
  onClick={() => navigate(`/members/${item.id}`)}
>
  {item.display_name || item.m_name_en || "—"}
</td>


                    <td>{item.m_gender}</td>
                    <td>{item.polling_booth_no}</td>
                   <td>
  {item?.h_no}
  {item?.sub ? `/${item.sub}` : ""}
</td>

                   <td>{item.family_name_en}</td>
                    <td>{item.m_age}</td>
                   <td className="text-center">
  <FontAwesomeIcon
    icon={faCircleXmark}
    className="text-danger"
    style={{ cursor: "pointer", fontSize: "1.4rem" }}
    title="Remove Member"
    onClick={() => openDeleteModal(item.id)}
  />
</td>



                  
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center text-muted">
                    No members found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Modal
        show={showAddMemberModal}

        onHide={() => {
  setShowAddMemberModal(false);
  setSelectedMember(null);
}}
        size="xl"
        centered
        backdrop="static"
        scrollable
      >
        <Modal.Header closeButton>
   
  </Modal.Header>
        <Modal.Body>
     <AddEditMember
  isOpen={showAddMemberModal}
  onClose={() => setShowAddMemberModal(false)}
  showBackButton={false}   // ✅ THIS LINE
  houseId={selectedHouseId}   // ✅ ADD THIS
  families={families}
  onAddMember={() => {
    setShowAddMemberModal(false);
    setLoadingMembers(true);
    axios
      .get(`${API_BASE_URL}/api/members?family=${houseData.family}`)
      .then(res =>
        setMembers(Array.isArray(res.data) ? res.data : res.data?.data || [])
      )
      .finally(() => setLoadingMembers(false));
  }}
/>
  </Modal.Body>
</Modal>

{showViewMemberModal && (
  <ViewMember
    isOpen={showViewMemberModal}
    onClose={() => {
      setShowViewMemberModal(false);
      setSelectedMember(null);
    }}
    member={selectedMember}
    wards={[]}   // wards data ഉണ്ടെങ്കിൽ ഇവിടെ pass ചെയ്യുക
  />
)}


<Modal
  show={showDeleteModal}
  onHide={() => setShowDeleteModal(false)}
  centered
>
  <Modal.Header closeButton>
    <Modal.Title>Confirm Delete</Modal.Title>
  </Modal.Header>

  <Modal.Body>
    Are you sure you want to remove this member?
  </Modal.Body>

  <Modal.Footer>
    <Button
      variant="secondary"
      onClick={() => setShowDeleteModal(false)}
    >
      Cancel
    </Button>

    <Button
      variant="danger"
      onClick={confirmDeleteMember}
    >
      Yes, Remove
    </Button>
  </Modal.Footer>
</Modal>


{/* ✅ Edit House Modal */}
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
  <Modal.Header closeButton>
    <Modal.Title>Edit House</Modal.Title>
  </Modal.Header>

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

<Modal
  show={showReassignModal}
  onHide={() => setShowReassignModal(false)}
  centered
  backdrop="static"
>
  <Modal.Header closeButton className="border-0 pb-0">
    <Modal.Title className="fw-bold text-dark">
      Confirm Member Transfer
    </Modal.Title>
  </Modal.Header>

  <Modal.Body className="pt-2">
    <div className="d-flex align-items-start gap-3">
      {/* 🔵 ICON */}
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          backgroundColor: "#e7f1ff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.4rem",
          color: "#0d6efd",
        }}
      >
        ℹ️
      </div>

      {/* 🔤 TEXT */}
      <div>
        {membersToReassign.length === 1 ? (
          <>
            <p className="fw-semibold mb-1 text-dark">
              This member is already assigned to another house.
            </p>
            <p className="text-muted mb-0">
              Do you want to remove them from the existing house and add them
              to this house?
            </p>
          </>
        ) : (
          <>
            <p className="fw-semibold mb-1 text-dark">
              One or more selected members are already assigned to another house.
            </p>
            <p className="text-muted mb-0">
              Do you want to remove them from their existing houses and add
              them to this house?
            </p>
          </>
        )}
      </div>
    </div>
  </Modal.Body>

  <Modal.Footer className="border-0 pt-2">
    <Button
      variant="outline-secondary"
      onClick={() => {
        setShowReassignModal(false);
        setMembersToReassign([]);
      }}
    >
      No
    </Button>

    <Button
      variant="primary"
      className="px-4"
      onClick={async () => {
        try {
          for (let member of membersToReassign) {
            await axios.put(
              `${API_BASE_URL}/api/members/${member.id}/assign-house/`,
              { house_id: houseData.id }
            );
          }

          toast.success("Members added successfully");

          const res = await axios.get(
  `${API_BASE_URL}/api/members?house=${houseData.id}`
);

          setMembers(res.data);

          setShowReassignModal(false);
          setMembersToReassign([]);
          setSelectedMemberIds([]);
          setShowAllMembersModal(false);
        } catch (err) {
          toast.error("Failed to add members");
        }
      }}
    >
      Yes, Transfer
    </Button>
  </Modal.Footer>
</Modal>








{/* ✅ All Members List Modal */}
{/* ✅ All Members List Modal with Search */}
{/* ✅ All Members List Modal */}
{/* ✅ All Members List Modal */}
{showAllMembersModal && (
  <>
    <div
      className="modal fade show"
      style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-xl modal-dialog-centered">
        <div className="modal-content">

          {/* ---------- MODAL HEADER ---------- */}
          <div className="modal-header">
            <h5 className="modal-title fw-bold">All Members List</h5>

            <button
              className="btn-close"
              onClick={() => setShowAllMembersModal(false)}
            ></button>
          </div>

          {/* ---------- MODAL BODY ---------- */}
          <div className="modal-body">
            <div className="mb-3">
  <input
    type="text"
    className="form-control"
    placeholder="🔍 Search by name, house, booth..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />
</div>

            {/* Loading */}
            {loadingAllMembers ? (
              <p className="text-center text-muted">Loading members...</p>
            ) : filteredMembers.length > 0 ? (
              <div
                className="table-responsive"
                style={{ maxHeight: "60vh", overflowY: "auto" }}
              >
                <table className="table table-bordered table-striped align-middle">
                  <thead className="table-primary text-center sticky-top">
                    <tr>
                      <th>Sl.No</th>
                      <th>Name</th>
                      <th>Gender</th>
                      <th>Booth No</th>
                      <th>House No</th>
                      <th>House Name</th>
                      <th>Age</th>
                      
                    </tr>
                  </thead>

                  <tbody>
                    {filteredMembers.map((item, index) => (
                      <tr
                        key={item.id}
                        onClick={() => {
                          if (selectedMemberIds.includes(item.id)) {
                            setSelectedMemberIds(
                              selectedMemberIds.filter(
                                (id) => id !== item.id
                              )
                            );
                          } else {
                            setSelectedMemberIds([
                              ...selectedMemberIds,
                              item.id,
                            ]);
                          }
                        }}
                        style={{
                          cursor: "pointer",
                          backgroundColor: selectedMemberIds.includes(
                            item.id
                          )
                            ? "#e7f9f7"
                            : "",
                        }}
                      >
                        <td className="text-center">{index + 1}</td>

                        <td
                          className="text-center"
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          {item.m_name_en}

                          {selectedMemberIds.includes(item.id) && (
                            <input
                              type="checkbox"
                              checked
                              readOnly
                              style={{
                                width: "18px",
                                height: "18px",
                                accentColor: "#0d6efd",
                              }}
                            />
                          )}
                        </td>

                        <td>{item.m_gender}</td>
                        <td>{item.polling_booth_no}</td>
                        <td>
  {item?.h_no}
  {item?.sub ? `/${item.sub}` : ""}
</td>

                        <td>{item.family_name_en}</td>
                        <td>{item.m_age}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-muted">No members found.</p>
            )}
          </div>

          {/* ---------- MODAL FOOTER (Correct Position) ---------- */}
          <div className="modal-footer">

            {selectedMemberIds.length > 0 && (
            <button
  className="btn btn-primary"
  onClick={() => {
    const selectedMembers = allMembers.filter(m =>
      selectedMemberIds.includes(m.id)
    );

    // 🔍 Optional debug (remove later)
    selectedMembers.forEach(m => {
      console.log(
        "CHECK MEMBER:",
        m.id,
        "house:",
        m.house?.id ?? "NONE",
        "current house:",
        houseData.id
      );
    });

    // 🔥 ALWAYS SHOW POPUP
    setMembersToReassign(selectedMembers);
    setShowAllMembersModal(false);
    setShowReassignModal(true);
  }}
>
  Add {selectedMemberIds.length} Member(s)
</button>



            )}

            {selectedMemberIds.length > 0 && (
              <button
                className="btn btn-outline-danger"
                onClick={() => setSelectedMemberIds([])}
              >
                Cancel Selection
              </button>
            )}

            <button
              className="btn btn-secondary"
              onClick={() => setShowAllMembersModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </>
)}




    </div>
  );
};

export default View;
