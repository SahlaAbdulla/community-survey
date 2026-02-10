import React, { useState, useEffect } from "react";
import { Modal, Row, Col, Form, Button, InputGroup } from "react-bootstrap";
import "./WardForm.css";

const WardForm = ({ isOpen, onClose, isEditable, wardData, onSave }) => {
  const [formData, setFormData] = useState({
    pin: "",
    constituency: "",
    sub_district: "",
    district: "",
    village: "",
    panchayath: "",
    block: "",
    polling_booth_no: "",
    ward: "",
  });

  const [postFields, setPostFields] = useState([{ post: "", pincode: "" }]);
  const [pollingBoothFields, setPollingBoothFields] = useState([{ polling_booth_no: "" }]);


  const [villageFields, setVillageFields] = useState([{ village: "" }]);
  const [panchayathFields, setPanchayathFields] = useState([{ panchayath: "" }]);
  const [wardFields, setWardFields] = useState([{ ward: "" }]);

    // ✅ Helper to capitalize first letter 🆕
  const capitalizeFirst = (value) =>
    value ? value.charAt(0).toUpperCase() + value.slice(1) : "";

  // ✅ District → Sub-district → Constituency mapping
  const districts = [
    "Thiruvananthapuram",
    "Kollam",
    "Pathanamthitta",
    "Alappuzha",
    "Kottayam",
    "Idukki",
    "Ernakulam",
    "Thrissur",
    "Palakkad",
    "Malappuram",
    "Kozhikode",
    "Wayanad",
    "Kannur",
    "Kasaragod",
  ];

  const subDistricts = {
    Thiruvananthapuram: ["Nedumangad", "Neyyattinkara", "Chirayinkeezhu", "Thiruvananthapuram"],
    Kollam: ["Kollam", "Kunnathur", "Karunagappally", "Pathanapuram", "Punalur"],
    Pathanamthitta: ["Adoor", "Konni", "Kozhenchery", "Ranni", "Mallappally"],
    Alappuzha: ["Ambalappuzha", "Cherthala", "Karthikappally", "Mavelikkara", "Chengannur"],
    Kottayam: ["Kottayam", "Vaikom", "Meenachil", "Changanassery"],
    Idukki: ["Thodupuzha", "Devikulam", "Udumbanchola", "Peerumedu"],
    Ernakulam: ["Kanayannur", "Kunnathunad", "Muvattupuzha", "Aluva", "Kochi"],
    Thrissur: ["Thrissur", "Chavakkad", "Kodungallur", "Mukundapuram", "Chalakudy"],
    Palakkad: ["Alathur", "Chittur", "Mannarkkad", "Ottapalam", "Pattambi"],
    Malappuram: ["Eranad", "Kondotty", "Nilambur", "Perinthalmanna", "Ponnani", "Tirur"],
    Kozhikode: ["Kozhikode", "Thamarassery", "Vadakara", "Koyilandy"],
    Wayanad: ["Mananthavady", "Sultan Bathery", "Vythiri"],
    Kannur: ["Thalassery", "Iritty", "Kannur", "Taliparamba", "Payyannur"],
    Kasaragod: ["Kasaragod", "Manjeshwaram", "Vellarikundu"],
  };

  const constituencies = {
    Thiruvananthapuram: ["Varkala", "Attingal", "Nedumangad", "Kazhakoottam", "Nemom", "Parassala"],
    Kollam: ["Kundara", "Kollam", "Chavara", "Punalur", "Kottarakkara", "Pathanapuram"],
    Pathanamthitta: ["Adoor", "Aranmula", "Ranni", "Konni", "Thiruvalla"],
    Alappuzha: ["Alappuzha", "Ambalappuzha", "Cherthala", "Kayamkulam", "Mavelikkara", "Haripad"],
    Kottayam: ["Kottayam", "Vaikom", "Ettumanoor", "Pala", "Changanassery"],
    Idukki: ["Thodupuzha", "Devikulam", "Udumbanchola", "Peerumedu"],
    Ernakulam: ["Ernakulam", "Thrikkakara", "Perumbavoor", "Angamaly", "Muvattupuzha", "Piravom"],
    Thrissur: ["Thrissur", "Ollur", "Guruvayur", "Chalakudy", "Kunnamkulam"],
    Palakkad: ["Palakkad", "Ottapalam", "Alathur", "Chittur"],
    Malappuram: ["Malappuram", "Manjeri", "Perinthalmanna", "Tirur", "Ponnani"],
    Kozhikode: ["Kozhikode North", "Kozhikode South", "Beypore", "Kunnamangalam", "Elathur"],
    Wayanad: ["Mananthavady", "Sulthan Bathery", "Kalpetta"],
    Kannur: ["Kannur", "Taliparamba", "Payyannur", "Azhikode", "Irikkur"],
    Kasaragod: ["Kasaragod", "Manjeshwaram", "Udma", "Trikaripur"],
  };

  // ✅ Load and clear data properly
  useEffect(() => {
  if (isOpen && wardData) {
    setFormData({
      pin: wardData.pin || "",
      constituency: wardData.constituency || "",
      sub_district: wardData.sub_district || "",
      district: wardData.district || "",
      block: wardData.block || "",
    });

    // 🏤 Posts (normalize object or string)
    setPostFields(
  Array.isArray(wardData.posts) && wardData.posts.length > 0
    ? wardData.posts.map(p => ({
        post: p.post || "",
        pincode: p.pincode || ""
      }))
    : [{ post: "", pincode: "" }]
);


    // 🏡 Villages (normalize object or string)
    setVillageFields(
      Array.isArray(wardData.villages)
        ? wardData.villages.map((v) =>
            typeof v === "object"
              ? { village: v.village || "" }
              : { village: v || "" }
          )
        : [{ village: wardData.village || "" }]
    );

    // 🏘️ Panchayaths (normalize object or string)
    setPanchayathFields(
      Array.isArray(wardData.panchayaths)
        ? wardData.panchayaths.map((p) =>
            typeof p === "object"
              ? { panchayath: p.panchayath || "" }
              : { panchayath: p || "" }
          )
        : [{ panchayath: wardData.panchayath || "" }]
    );

     setWardFields(
  Array.isArray(wardData.ward) && wardData.ward.length > 0
    ? wardData.ward.map(w =>
        typeof w === "object" ? { ward: w.ward || "" } : { ward: w }
      )
    : [{ ward: "" }]
);


    // 🗳️ Polling Booths (normalize object or string)
    // ✅ Polling Booths (support booth name & number)
setPollingBoothFields(
  Array.isArray(wardData.polling_booth_no)
    ? wardData.polling_booth_no.map((b) =>
        typeof b === "object"
          ? {
              polling_booth_no: b.polling_booth_no || "",
              booth_name: b.booth_name || ""
            }
          : { polling_booth_no: b, booth_name: "" }
      )
    : [{ polling_booth_no: "", booth_name: "" }]
);

  } else if (!isOpen) {
    // 🧹 Clear form when modal is closed
    setFormData({
      pin: "",
      constituency: "",
      sub_district: "",
      district: "",
      block: "",
    });
    setPostFields([{ post: "", pincode: "" }]);
    setVillageFields([{ village: "" }]);
    setPanchayathFields([{ panchayath: "" }]);
    setWardFields([{ ward: "" }]);
    setPollingBoothFields([{ polling_booth_no: "",booth_name: "" }]);
  }
}, [isOpen, wardData]);

  // Handlers
   // ✅ Updated to auto-capitalize 🆕
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    const capitalized = capitalizeFirst(value);
    setFormData((prev) => ({
      ...prev,
      [name]: capitalized,
      ...(name === "district" ? { sub_district: "", constituency: "" } : {}),
    }));
  };

  // ✅ Updated to auto-capitalize first letter while typing
const handleDynamicChange = (setFields, fields, index, key, value) => {
  const updated = [...fields];
  const capitalized =
    key === "pincode"
      ? value // don't touch numbers
      : value.charAt(0).toUpperCase() + value.slice(1);
  updated[index][key] = capitalized;
  setFields(updated);
};


  const handleAddField = (setFields, fields, key) => {
    setFields([...fields, { [key]: "" }]);
  };

  const handleRemoveField = (setFields, fields, index, key) => {
    const updated = [...fields];
    updated.splice(index, 1);
    setFields(updated.length ? updated : [{ [key]: "" }]);
  };

  const handleSubmit = (e) => {
  e.preventDefault();

  const finalData = {
    ...formData,
    posts: postFields
      .filter(p => p.post || p.pincode)
      .map(p => ({ post: p.post, pincode: p.pincode })),

    // 🏡 Flatten arrays to plain strings
    villages: villageFields.map(v => v.village).filter(Boolean),
    panchayaths: panchayathFields.map(p => p.panchayath).filter(Boolean),
    ward: wardFields.map(p => p.ward).filter(Boolean),
    polling_booth_no: pollingBoothFields
  .filter(b => b.polling_booth_no || b.booth_name)
  .map(b => ({
    polling_booth_no: b.polling_booth_no,
    booth_name: b.booth_name
  })),

  };

  console.log("➡️ Final data sent:", finalData);
  onSave(finalData);
};



  return (
    <Modal show={isOpen} onHide={onClose} centered size="lg" backdrop="static" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>
          📂 {isEditable ? "Edit Ward Details" : "Add New Ward"}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Row className="gy-3">

                        <Col md={6}>
<Form.Group>
  <Form.Label>Polling Booth No & Name</Form.Label>

  {pollingBoothFields.map((item, index) => (
    <InputGroup key={index} className="mb-2">

      <Form.Control
        type="text"
        placeholder="Booth No"
        value={item.polling_booth_no}
        onChange={(e) =>
          handleDynamicChange(setPollingBoothFields, pollingBoothFields, index, "polling_booth_no", e.target.value)
        }
      />

      <Form.Control
        type="text"
        placeholder="Booth Name"
        value={item.booth_name}
        onChange={(e) =>
          handleDynamicChange(setPollingBoothFields, pollingBoothFields, index, "booth_name", e.target.value)
        }
      />

      {pollingBoothFields.length > 1 && (
        <Button
          variant="outline-danger"
          onClick={() => handleRemoveField(setPollingBoothFields, pollingBoothFields, index)}
        >
          🗑️
        </Button>
      )}

      {index === pollingBoothFields.length - 1 && (
        <Button
          variant="outline-primary"
          onClick={() => handleAddField(setPollingBoothFields, pollingBoothFields, "polling_booth_no")}
        >
          +
        </Button>
      )}
    </InputGroup>
  ))}
</Form.Group>




</Col>

            {/* Post */}
            {/* Post & Pincode */}
<Col md={6}>
  <Form.Group>
    <Form.Label>Post & Pincode</Form.Label>
    {postFields.map((item, index) => {
      const isLast = index === postFields.length - 1;
      return (
        <InputGroup key={index} className="mb-2">
          <Form.Control
            type="text"
            placeholder="Enter Post Name"
            value={item.post || ""}
            onChange={(e) =>
              handleDynamicChange(setPostFields, postFields, index, "post", e.target.value)
            }
          />
          <Form.Control
            type="text"
            placeholder="Enter Pincode"
            value={item.pincode || ""}
            onChange={(e) =>
              handleDynamicChange(setPostFields, postFields, index, "pincode", e.target.value)
            }
          />

          {/* Show delete button if more than 1 field */}
          {postFields.length > 1 && (
            <Button
              variant="outline-danger"
              onClick={() => handleRemoveField(setPostFields, postFields, index, "post")}
            >
              🗑️
            </Button>
          )}

          {/* Last row always gets + button */}
          {isLast && (
            <Button
              variant="outline-primary"
              onClick={() => handleAddField(setPostFields, postFields, "post")}
            >
              +
            </Button>
          )}
        </InputGroup>
      );
    })}
  </Form.Group>
</Col>

           <Col md={6}>
  <Form.Group>
    <Form.Label>Panchayath</Form.Label>
    {panchayathFields.map((item, index) => {
      const isLast = index === panchayathFields.length - 1;
      return (
        <InputGroup key={index} className="mb-2">
          <Form.Control
            type="text"
            placeholder="Enter Panchayath Name"
            value={item.panchayath || ""}
            onChange={(e) =>
              handleDynamicChange(setPanchayathFields, panchayathFields, index, "panchayath", e.target.value)
            }
          />

          {panchayathFields.length > 1 && (
            <Button
              variant="outline-danger"
              onClick={() =>
                handleRemoveField(setPanchayathFields, panchayathFields, index, "panchayath")
              }
            >
              🗑️
            </Button>
          )}

          {isLast && (
            <Button
              variant="outline-primary"
              onClick={() =>
                handleAddField(setPanchayathFields, panchayathFields, "panchayath")
              }
            >
              +
            </Button>
          )}
        </InputGroup>
      );
    })}
  </Form.Group>
</Col>

           <Col md={6}>
  <Form.Group>
    <Form.Label>Ward</Form.Label>
    {wardFields.map((item, index) => {
      const isLast = index === wardFields.length - 1;
      return (
        <InputGroup key={index} className="mb-2">
          <Form.Control
            type="text"
            placeholder="Enter ward Name"
            value={item.ward || ""}
            onChange={(e) =>
              handleDynamicChange(setWardFields, wardFields, index, "ward", e.target.value)
            }
          />

          {wardFields.length > 1 && (
            <Button
              variant="outline-danger"
              onClick={() =>
                handleRemoveField(setWardFields, wardFields, index, "ward")
              }
            >
              🗑️
            </Button>
          )}

          {isLast && (
            <Button
              variant="outline-primary"
              onClick={() =>
                handleAddField(setWardFields, wardFields, "ward")
              }
            >
              +
            </Button>
          )}
        </InputGroup>
      );
    })}
  </Form.Group>
</Col>


                        {/* Panchayath, Village, Block, Polling Booth remain same */}
            <Col md={6}>
  <Form.Group>
    <Form.Label>Village</Form.Label>
    {villageFields.map((item, index) => {
      const isLast = index === villageFields.length - 1;
      return (
        <InputGroup key={index} className="mb-2">
          <Form.Control
            type="text"
            placeholder="Enter Village Name"
            value={item.village || ""}
            onChange={(e) =>
              handleDynamicChange(setVillageFields, villageFields, index, "village", e.target.value)
            }
          />

          {villageFields.length > 1 && (
            <Button
              variant="outline-danger"
              onClick={() =>
                handleRemoveField(setVillageFields, villageFields, index, "village")
              }
            >
              🗑️
            </Button>
          )}

          {isLast && (
            <Button
              variant="outline-primary"
              onClick={() =>
                handleAddField(setVillageFields, villageFields, "village")
              }
            >
              +
            </Button>
          )}
        </InputGroup>
      );
    })}
  </Form.Group>
</Col>


                        <Col md={6}>
              <Form.Group>
                <Form.Label>Block</Form.Label>
                <Form.Control
                  type="text"
                  name="block"
                  value={formData.block}
                  onChange={handleFormChange}
                />
              </Form.Group>
            </Col>




            {/* District */}
            <Col md={6}>
              <Form.Group>
                <Form.Label>District</Form.Label>
                <Form.Select
                  name="district"
                  value={formData.district}
                  onChange={handleFormChange}
                  required
                >
                  <option value="">-- Select District --</option>
                  {districts.map((d, i) => (
                    <option key={i} value={d}>{d}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Sub District */}
            <Col md={6}>
              <Form.Group>
                <Form.Label>Sub District</Form.Label>
                <Form.Select
                  name="sub_district"
                  value={formData.sub_district}
                  onChange={handleFormChange}
                  disabled={!formData.district}
                  required
                >
                  <option value="">-- Select Sub District --</option>
                  {formData.district &&
                    subDistricts[formData.district]?.map((sd, i) => (
                      <option key={i} value={sd}>{sd}</option>
                    ))}
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Constituency */}
            <Col md={6}>
              <Form.Group>
                <Form.Label>Constituency</Form.Label>
                <Form.Select
                  name="constituency"
                  value={formData.constituency}
                  onChange={handleFormChange}
                  disabled={!formData.district}
                  required
                >
                  <option value="">-- Select Constituency --</option>
                  {formData.district &&
                    constituencies[formData.district]?.map((c, i) => (
                      <option key={i} value={c}>{c}</option>
                    ))}
                </Form.Select>
              </Form.Group>
            </Col>






          </Row>
        </Modal.Body>

        <Modal.Footer className="d-flex justify-content-end gap-2">
          <Button variant="secondary" onClick={onClose}>Close</Button>
          <Button type="submit" variant="success">
            {isEditable ? "Update" : "Save"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default WardForm;
