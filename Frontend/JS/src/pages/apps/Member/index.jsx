// ✅ MemberDetailsApp.jsx (Simple Pagination – As Required)

import React, { useEffect, useState } from "react";
import { Card, Button, Table, Modal, Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faEdit, faEye } from "@fortawesome/free-solid-svg-icons";

import PageTitle from "../../../components/PageTitle";
import api from "../../../api/axios";
import AddEditMember from "./AddEditMember";
import ViewMember from "./ViewMember";
import { toast, ToastContainer } from "react-toastify";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";

const MemberDetailsApp = () => {
  const [members, setMembers] = useState([]);
  const [families, setFamilies] = useState([]);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔍 search
  const [searchTerm, setSearchTerm] = useState("");

  // 📄 pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // modals
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // 🔹 fetch data
  const fetchAll = async () => {
    try {
      setLoading(true);
      const [mRes, fRes, wRes] = await Promise.all([
        api.get("members/"),
        api.get("families/"),
        api.get("wards/"),
      ]);

      setMembers(mRes.data);
      setFamilies(fRes.data);
      setWards(wRes.data);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // 🔍 search filter
  const filteredMembers = members.filter((m) => {
    const s = searchTerm.toLowerCase();
    return [
      m.m_name_en,
      m.m_name_ml,
      m.phone_no,
      m.family_name_en,
      m.family_name_ml,
    ].some((v) => v?.toLowerCase().includes(s));
  });

  // 📄 pagination logic
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;

  const currentMembers = filteredMembers.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // 📥 export excel
  const exportToExcel = () => {
    if (!members.length) return;
    const ws = XLSX.utils.json_to_sheet(members);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Members");
    XLSX.writeFile(wb, "Members.xlsx");
  };

  const handleDeleteMember = async (id) => {
    try {
      await api.delete(`members/${id}/`);
      toast.success("Member deleted");
      fetchAll();
    } catch {
      toast.error("Delete failed");
    }
  };

  const navigate = useNavigate();


  

  return (
    <>
      <ToastContainer />
      <PageTitle title="Member List" />

      <Card>
        <Card.Body>
          <div className="d-flex justify-content-between mb-3">
            <input
              className="form-control w-25"
              placeholder="🔍 Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            <Button onClick={() => navigate("/members/add")}>
  + Add Member
</Button>

          </div>

          {loading ? (
            <Spinner />
          ) : (
            <>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Family Name</th>
                    <th>Gender</th>
                    <th>Age</th>
                    <th>Phone</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentMembers.map((m, idx) => (
                    <tr key={m.id}>
                      <td>{startIndex + idx + 1}</td>
                     <td
  className="fw-bold text-dark"
  style={{ cursor: "pointer" }}
  onClick={() => navigate(`/members/${m.id}`)}
>
  {m.display_name || m.m_name_en}
</td>
               <td
  style={{
    cursor: "pointer",
    color: "black",
    fontWeight: "500",
  }}
  onClick={async () => {
    try {
      // 1️⃣ get houses of that family
      const res = await api.get(`houses?family_id=${m.family}`);

      if (res.data.length === 0) {
        toast.error("No house found for this family");
        return;
      }

      // 2️⃣ take first house (same logic as HouseList row click)
      const houseId = res.data[0].id;

      // 3️⃣ navigate to view-house
      navigate(`/view-house/${houseId}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load house");
    }
  }}
>
  {m.family_name_en}
</td>

                      <td>{m.m_gender}</td>
                      <td>{m.m_age}</td>
                      <td>{m.phone_no || "Nil"}</td>
                      <td>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedMember(m);
                            setShowViewModal(true);
                          }}
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </Button>{" "}
                        <Button
                          size="sm"
                          variant="warning"
                          onClick={() => {
                            setSelectedMember(m);
                            setShowModal(true);
                          }}
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </Button>{" "}
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => {
                            setMemberToDelete(m);
                            setShowDeleteModal(true);
                          }}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {/* ✅ SIMPLE PAGINATION (AS YOU WANT) */}
              <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
                                 
                                 {/* PAGE NUMBERS */}
                                 <div>
                                   {Array.from({ length: totalPages }, (_, i) => i + 1)
                                     .slice(
                                       Math.max(currentPage - 3, 0),
                                       currentPage + 2
                                     )
                                     .map((page) => (
                                       <Button
                                         key={page}
                                         size="sm"
                                         className="mx-1"
                                         variant={
                                           page === currentPage
                                             ? "primary"
                                             : "outline-secondary"
                                         }
                                         onClick={() => setCurrentPage(page)}
                                       >
                                         {page}
                                       </Button>
                                     ))}
                                 </div>
             
                                 {/* ROWS PER PAGE */}
                                 <div className="d-flex align-items-center gap-2">
                                   <span className="text-muted">Rows:</span>
                                   <select
                                     className="form-select form-select-sm"
                                     style={{ width: "120px" }}
                                     value={itemsPerPage}
                                     onChange={(e) => {
                                       setItemsPerPage(Number(e.target.value));
                                       setCurrentPage(1);
                                     }}
                                   >
                                     <option value={25}>25 / page</option>
                                     <option value={50}>50 / page</option>
                                     <option value={100}>100 / page</option>
                                     <option value={200}>200 / page</option>
                                     <option value={300}>300 / page</option>
                                     <option value={400}>400 / page</option>
                                     <option value={500}>500 / page</option>
                                     <option value={600}>600 / page</option>
                                     <option value={700}>700 / page</option>
                                     <option value={800}>800 / page</option>
                                     <option value={900}>900 / page</option>
                                     <option value={1000}>1000 / page</option>
                                     <option value={1100}>1100 / page</option>
                                     <option value={1200}>1200 / page</option>
                                     <option value={1300}>1300 / page</option>
                                     <option value={1400}>1400 / page</option>
                                     <option value={1500}>1500 / page</option>
                                     <option value={1600}>1600 / page</option>
                                     <option value={1708}>1708 / page</option>
                                   </select>
                                 </div>
                               </div>

            </>
          )}

          <Button className="mt-3" variant="success" onClick={exportToExcel}>
            📥 Export Excel
          </Button>
        </Card.Body>
      </Card>
 <Modal
  show={showModal}
  onHide={() => {
    setShowModal(false);
    setSelectedMember(null);
  }}
  size="xl"
  centered
  backdrop="static"
  scrollable
><Modal.Header closeButton>
    
  </Modal.Header>
   <Modal.Body>
      <AddEditMember
        isOpen={showModal}
        isEditable={!!selectedMember}
        memberData={selectedMember}
        families={families}
        onClose={() => {
          setShowModal(false);
          setSelectedMember(null);
        }}
        onSuccess={() => {
          fetchAll();
          
        }}
      />
       </Modal.Body>
</Modal>

  
  

 
     <ViewMember
  show={showViewModal}
  onHide={() => setShowViewModal(false)}
  member={selectedMember}
  wards={wards}
/>


      {/* 🗑️ Delete Modal */}
      <Modal show={showDeleteModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Delete <b>{memberToDelete?.m_name_en}</b>?
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button
            variant="danger"
            onClick={() => {
              handleDeleteMember(memberToDelete.id);
              setShowDeleteModal(false);
            }}
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default MemberDetailsApp;
