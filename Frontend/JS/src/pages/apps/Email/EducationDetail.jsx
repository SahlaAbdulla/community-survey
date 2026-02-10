import React, { useState } from "react";
import { Row, Col, Card, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

// components
import PageTitle from "../../../components/PageTitle";
import LeftBar from "./LeftBar";

// dummy education data
const educationData = {
  school_name: "St. Thomas Higher Secondary School",
  address: "Kottayam, Kerala",
  headmaster: "Joseph Mathew",
  contact_no: "9847000000",
  total_students: 520,
  levels: ["Primary", "High School", "Higher Secondary"],
  courses: ["Science", "Commerce", "Humanities"],
  facilities: ["Library", "Computer Lab", "Playground", "Smart Classrooms"],
};

const EducationDetail = () => {
  const [edu] = useState(educationData);

  return (
    <>
      <PageTitle
        breadCrumbItems={[
          { label: "Education", path: "/apps/education/details" },
          { label: "Education Detail", path: "/apps/education/details", active: true },
        ]}
        title={"Education Detail"}
      />

      <Row>
        <Col>
          <Card>
            <Card.Body>
              <div className="inbox-leftbar">
                <Link
                  to="/apps/education/add"
                  className="btn btn-danger w-100 waves-effect waves-light"
                >
                  Add Education Info
                </Link>

                <LeftBar totalUnreadEmails={0} /> {/* can reuse or replace */}
              </div>

              <div className="inbox-rightbar">
                <div className="mt-4">
                  <h5 className="font-18">{edu.school_name}</h5>
                  <hr />

                  <p><b>Address:</b> {edu.address}</p>
                  <p><b>Headmaster:</b> {edu.headmaster}</p>
                  <p><b>Contact:</b> {edu.contact_no}</p>
                  <p><b>Total Students:</b> {edu.total_students}</p>

                  <h6 className="mt-3">Levels</h6>
                  <ul>
                    {edu.levels.map((lvl, idx) => (
                      <li key={idx}>{lvl}</li>
                    ))}
                  </ul>

                  <h6 className="mt-3">Courses Offered</h6>
                  <ul>
                    {edu.courses.map((c, idx) => (
                      <li key={idx}>{c}</li>
                    ))}
                  </ul>

                  <h6 className="mt-3">Facilities</h6>
                  <ul>
                    {edu.facilities.map((f, idx) => (
                      <li key={idx}>{f}</li>
                    ))}
                  </ul>

                  <div className="mt-4">
                    <Button variant="secondary" className="me-2">
                      <i className="mdi mdi-reply me-1"></i> Edit
                    </Button>
                    <Button variant="light">
                      Delete <i className="mdi mdi-delete ms-1"></i>
                    </Button>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default EducationDetail;
