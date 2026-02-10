import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Card,
  Button,
  Spinner,
  Badge,
  Tabs,
  Tab,
  Table,
} from "react-bootstrap";
import PageTitle from "@/components/PageTitle";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/* YES / NO BADGE */
const YesNo = ({ value }) =>
  value === true ? (
    <Badge bg="success">YES</Badge>
  ) : (
    <Badge bg="secondary">NO</Badge>
  );

/* SECTION TABLE */
const SectionBlock = ({ rows }) => (
  <Table bordered responsive size="sm" className="mb-2" style={{ marginTop: 0 }}>
    <tbody>
      {rows.map((row, i) => (
        <tr key={i}>
          <th style={{ width: "35%" }}>{row.label}</th>
          <td style={{ width: "65%" }}>{row.value ?? "—"}</td>
        </tr>
      ))}
    </tbody>
  </Table>
);

const MemberDetails = () => {
  const { id, name } = useParams();
  const navigate = useNavigate();

  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMember();
  }, [id]);

  const fetchMember = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/members/${id}/`);
      setMember(res.data);
    } catch (err) {
      console.error("Error fetching member:", err);
    } finally {
      setLoading(false);
    }
  };

   useEffect(() => {
  if (member?.m_name_en) {
    const slug = member.m_name_en
      .trim()
      .replace(/\s+/g, "-");

    if (!name || name !== slug) {
      navigate(`/members/${id}/${slug}`, { replace: true });
    }
  }
}, [member]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner />
      </div>
    );
  }

 


  if (!member) return <p className="text-danger">Member not found</p>;

  return (
    <>
      <PageTitle title="Member Full Details" />

      {/* 🔥 INLINE CSS – NO SEPARATE FILE */}
      <style>
        {`
          .custom-tabs .nav-tabs {
            border-bottom: 1px solid #e5e7eb;
          }

          .custom-tabs .nav-link {
            border: none !important;
            background: transparent !important;
            color: #6b7280;
            font-weight: 500;
            padding: 12px 16px;
          }

          .custom-tabs .nav-link.active {
            color: #2563eb;
            border-bottom: 3px solid #2563eb !important;
          }

          .custom-tabs .nav-link:hover {
            color: #2563eb;
          }

          .tab-content > .tab-pane {
            padding-top: 0 !important;
          }
        `}
      </style>

      <div className="d-flex justify-content-center px-3">
        <Card className="mb-3 w-100" style={{ maxWidth: "1100px" }}>
          <Card.Body className="pt-2">
            <div className="d-flex justify-content-between mb-3">
              <h5>{member.m_name_en}</h5>
              <Button size="sm" variant="secondary" onClick={() => navigate(-1)}>
                ⬅ Back
              </Button>
            </div>

            <Tabs
              defaultActiveKey="basic"
              justify
              className="custom-tabs"
            >
              <Tab eventKey="basic" title="Basic Details">
                <SectionBlock
                  rows={[
                   { label: "Name (EN)", value: member.display_name || member.m_name_en || "—" },
                    { label: "Name (ML)", value: member.m_name_ml },
                    { label: "Gender", value: member.m_gender },
                    { label: "Age", value: member.m_age },
                    { label: "DOB", value: member.date_of_birth },
                    { label: "Phone", value: member.phone_no },
                    { label: "Relation", value: member.m_relation },
                    { label: "Marital Status", value: member.marital_status },
                    { label: "Blood Group", value: member.blood_grp },
                  ]}
                />
              </Tab>

              <Tab eventKey="family" title="Family Details">
                <SectionBlock
                  rows={[
                    { label: "Family", value: member.family_name_common },
                    { label: "House Owner", value: member.owner_name },
                    { label: "Religion", value: member.religion },
                    { label: "Caste", value: member.caste },
                  ]}
                />
              </Tab>

              <Tab eventKey="education" title="Education">
                {member.educations?.length ? (
                  member.educations.map((edu, i) => (
                    <SectionBlock
                      key={i}
                      rows={[
                        { label: "Education", value: edu.education },
                        { label: "Stream", value: edu.education_stream },
                        { label: "Status", value: edu.education_status },
                      ]}
                    />
                  ))
                ) : (
                  <p className="text-muted">No education data</p>
                )}
              </Tab>

              <Tab eventKey="job" title="Job Details">
                <SectionBlock
                  rows={[
                    { label: "Job Status", value: <YesNo value={member.job_status} /> },
                    { label: "Job Country", value: member.job_country },
                    { label: "Monthly Income", value: member.monthly_income },
                    { label: "Organization", value: member.organization },
                    { label: "Organization Type", value: member.org_type },
                  ]}
                />
              </Tab>

              <Tab eventKey="political" title="Political">
                <SectionBlock
                  rows={[
                    { label: "Election ID", value: <YesNo value={member.election_id} /> },
                    { label: "SEC ID", value: member.voter_id_number },
                    { label: "Roll No (SEC)", value: member.roll_no_sec },
                    { label: "Roll No (CEO)", value: member.roll_no_ceo },
                    { label: "EPIC ID", value: member.epic_id },
                    { label: "SIR 2002", value: <YesNo value={member.has_2002} /> },
                    { label: "Roll No 2002", value: member.roll_no_2002 },
                    { label: "Roll No 2025", value: member.roll_no_2025 },
                    { label: "Ward", value: member.ward },
                    { label: "Constituency", value: member.constituency_name },
                    { label: "Polling Booth", value: member.polling_booth_no },
                    { label: "Political Party", value: member.political_party },
                    { label: "Political Type", value: member.political_type },
                  ]}
                />
              </Tab>

              <Tab eventKey="health" title="Health">
                <SectionBlock
                  rows={[
                    { label: "Pension", value: <YesNo value={member.m_pension} /> },
                    { label: "Pension Type", value: member.pension_type },
                    {
                      label: "Chronic Disease",
                      value: <YesNo value={member.has_chronic_disease} />,
                    },
                    { label: "Disease Name", value: member.chronic_disease },
                    { label: "Disability", value: <YesNo value={member.m_disability} /> },
                    {
                      label: "Health Insurance",
                      value: <YesNo value={member.m_health_insurance} />,
                    },
                  ]}
                />
              </Tab>
            </Tabs>
          </Card.Body>
        </Card>
      </div>
    </>
  );
};

export default MemberDetails;
