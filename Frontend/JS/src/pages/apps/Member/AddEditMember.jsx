import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Modal, Row, Col, Button, Nav, Form } from "react-bootstrap";

import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { FormInput } from "../../../components";
import MalayalamSuggestInput from "../../../components/MalayalamSuggestInput";
import api from "../../../api/axios";
import { toast } from "react-toastify";
import Select from "react-select";
import { useNavigate } from "react-router-dom";


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// helper
const capitalizeFirst = (value) => {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
};

// validation schema (keep fields nullable)
const schema = yup.object().shape({
  m_name_en: yup.string().nullable(),
  m_name_ml: yup.string().nullable(),
  family_id: yup.mixed().nullable(),
  family: yup.mixed().nullable(),
  family_name_common: yup.mixed().nullable(),
  m_gender: yup.string().nullable(),
  date_of_birth: yup.string().nullable().transform((v) => (v === "" ? null : v)),
  m_age: yup.number().nullable().transform((v) => (isNaN(v) ? null : v)),
  phone_no: yup.string().nullable(),
  m_relation: yup.string().nullable(),
  marital_status: yup.string().nullable(),
  blood_grp: yup.string().nullable(),
  religion: yup.string().nullable(),
  caste: yup.string().nullable(),
  job_status: yup.string().nullable(),
  job_country: yup.string().nullable(),
  monthly_income: yup.number().nullable().transform((v) => (isNaN(v) ? null : v)),
  organization: yup.string().nullable(),
  org_type: yup.string().nullable(),
  m_pension: yup.string().nullable(),
  pension_type: yup.string().nullable(),
  m_disability: yup.string().nullable(),
  m_health_insurance: yup.string().nullable(),
  chronic_disease: yup.string().nullable(),
  political_party: yup.string().nullable(),
  political_type: yup.string().nullable(),
  polling_booth_no: yup.string().nullable(),
  guardian_en: yup.string().nullable(),
  guardian_ml: yup.string().nullable(),
  roll_no_2002: yup.string().nullable(),
  roll_no_2025: yup.string().nullable(),
  epic_id : yup.string().nullable(),
  roll_no_sec: yup.string().nullable(),
  roll_no_ceo: yup.string().nullable(),
  g_relation: yup.string().nullable(),
  ward: yup.string().nullable(),
  ward_id: yup.string().nullable(),
  constituency_id: yup.mixed().nullable(), // use constituency_id instead of constituency text
  voter_id_number: yup.string().nullable(),
  election_id: yup.string().nullable(),
  has_2002: yup.string().nullable(),


  educations: yup
    .array()
    .of(
      yup.object().shape({
        education: yup.string().nullable(),
        education_status: yup.string().nullable(),
        education_stream: yup.string().nullable(),
      })
    )
    .nullable(),
});

const AddEditMember = ({
  
  isOpen,
  onClose,
  isEditable,
  memberData,
  onRemoveMember,
  onUpdateMember,
  onAddMember,
  houseId,
  onSuccess,
  families = [],
}) => {
  const {
    control,
    handleSubmit,
    register,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      m_name_en: "",
      m_name_ml: "",
      family: "",
      family_name_common: "",
      owner_name: "",
      m_gender: "",
      date_of_birth: "",
      m_age: "",
      phone_no: "",
      m_relation: "",
      marital_status: "",
      blood_grp: "",
      religion: "",
      caste: "",
      educations: [{ education: "", education_status: "", education_stream: "" }],
      job_status: "",
      job_country: "",
      monthly_income: "",
      organization: "",
      org_type: "",
      m_pension: "",
      pension_type: "",
      has_chronic_disease: "",
      chronic_disease: "",
      election_id: "",
      voter_id_number: "",
      has_2002: "",
      guardian_en: "",
      guardian_ml: "",
      roll_no_2002: "",
      epic_id: "",
      roll_no_sec: "",
      constituency_id: "", // FK field shown in UI
      roll_no_ceo: "",

      polling_booth_no: "",
      roll_no_2025: "",
      g_relation: "",
      ward: "",
      ward_id: "",
      political_party: "",
      political_type: "",
      m_disability: "",
      m_health_insurance: "",
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "educations" });

  // UI tab state
  const [activeSection, setActiveSection] = useState("basic");

  // wards list fetched from API (each ward should include constituency & constituency_id)
  const [wards, setWards] = useState([]);
  const [familiesList, setFamiliesList] = useState([]);


  // watches
  const dobValue = watch("date_of_birth");
  const selectedFamily = watch("family");
  const jobStatus = watch("job_status");
  const pensionStatus = watch("m_pension");
  const chronicStatus = watch("has_chronic_disease");
  const electionId = watch("election_id");
  const organization = watch("organization");
  const politicalParty = watch("political_party");

  // calculate m_age from dob
  useEffect(() => {
  // ✅ If DOB exists → calculate age
  if (dobValue) {
    const birthDate = new Date(dobValue);
    const today = new Date();

    if (!isNaN(birthDate) && birthDate <= today) {
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
      setValue("m_age", age >= 0 ? age : "");
      return;
    }
  }

  // ✅ If DOB missing → fallback to backend age
  if (isEditable && memberData?.m_age) {
    setValue("m_age", memberData.m_age);
  }
}, [dobValue, isEditable, memberData, setValue]);


  const [pollingBooths, setPollingBooths] = useState([]);

  const fetchPollingBooths = async () => {
  try {
    const res = await api.get("wards/");

    const booths = res.data.flatMap((ward) => ward.polling_booth_no || []);
    setPollingBooths(booths);

  } catch (err) {
    console.error("Error fetching polling booths:", err);
  }
};

useEffect(() => {
  fetchPollingBooths();
}, []);

const navigate = useNavigate();

  // auto-fill owner name (fetch houses for selected family)
  useEffect(() => {
    if (!selectedFamily) {
      setValue("owner_name", "");
      return;
    }
    const fetchOwner = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/houses/?family_id=${selectedFamily}`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const house = data[0];
          setValue("owner_name", house.owner_en || house.owner_ml || "");
        } else {
          setValue("owner_name", "");
        }
      } catch (err) {
        console.error("Error fetching owner:", err);
        setValue("owner_name", "");
      }
    };
    fetchOwner();
  }, [selectedFamily, setValue]);

  // fetch wards once when component mounts (so we can derive constituency -> ward mapping)
  useEffect(() => {
    const fetchWards = async () => {
      try {
        const res = await api.get("wards/"); // adjust endpoint if different
        // expected shape: [{ id, ward_name, constituency, constituency_id, ... }, ...]
        setWards(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error fetching wards:", err);
        setWards([]);
      }
    };
    fetchWards();
  }, []);

  // when modal opens, populate values (edit) or reset (add)
  useEffect(() => {
    
  if (!isOpen) return;

  if (isEditable && memberData) {
     console.log("🟢 EDIT MODE DATA:", memberData); // <-- ഇതാണ് ചേർക്കേണ്ടത്
    reset({
      ...memberData,
      family: memberData.family ? String(memberData.family) : "",
      m_disability: String(memberData.m_disability ?? ""),
      m_pension: String(memberData.m_pension ?? ""),
      m_health_insurance: String(memberData.m_health_insurance ?? ""),
      job_status: String(memberData.job_status ?? ""),
      election_id: String(memberData.election_id ?? ""),
      has_chronic_disease: String(memberData.has_chronic_disease ?? ""),
      has_2002:
    memberData.roll_no_2002 &&
    memberData.roll_no_2002 !== "null"
      ? "true"
      : "false",

  roll_no_2002: memberData.roll_no_2002 || "",
    constituency_id: memberData.constituency ? String(memberData.constituency) : "", // ✅ FIXED
    polling_booth_no: memberData.polling_booth_no || "",
 
      ward_id: memberData.ward_id ?? "",
      educations:
        memberData.educations?.length > 0
          ? memberData.educations.map((edu) => ({
              education: edu.education || "",
              education_status: edu.education_status || "",
              education_stream: edu.education_stream || "",
            }))
          : [{ education: "", education_status: "", education_stream: "" }],
    });

    setActiveSection("basic");
  } else {
    reset({
      m_name_en: "",
      m_name_ml: "",
      family: "",
      family_name_common: "",
      owner_name: "",
      m_gender: "",
      date_of_birth: "",
      m_age: "",
      phone_no: "",
      m_relation: "",
      marital_status: "",
      blood_grp: "",
      religion: "",
      caste: "",
      educations: [{ education: "", education_status: "", education_stream: "" }],
      job_status: "",
      job_country: "",
      monthly_income: "",
      organization: "",
      org_type: "",
      m_pension: "",
      pension_type: "",
      has_chronic_disease: "",
      chronic_disease: "",
      election_id: "",
      voter_id_number: "",
      constituency_id: "",
      ward_id: "",
      roll_no_2025: "",
      g_relation: "",
      ward: "",
      roll_no_ceo: "",
      guardian_en: "",
      guardian_ml: "",
      roll_no_2002: "",
      epic_id: "",
      roll_no_sec: "",
      polling_booth_no: "",
      political_party: "",
      political_type: "",
      m_disability: "",
      m_health_insurance: "",
    });

    setActiveSection("basic");
  }
}, [isOpen, isEditable, memberData]); // ✅ wards removed

  // handle when user selects a constituency from dropdown
const handleConstituencySelect = (constituencyId) => {
  setValue("constituency_id", constituencyId);  // ✅ only constituency set
};

const onSubmit = async (data) => {
  // 🔄 Normalize payload
  const formatted = {
    ...data,
    family_id: data.family ? Number(data.family) : null,
    house: houseId,

    m_pension: data.m_pension === "true",
    m_disability: data.m_disability === "true",
    m_health_insurance: data.m_health_insurance === "true",
    job_status: data.job_status === "true",
    election_id: data.election_id === "true",
    has_chronic_disease: data.has_chronic_disease === "true",

    monthly_income:
      data.monthly_income && data.monthly_income.toString().trim() !== ""
        ? parseInt(data.monthly_income, 10)
        : null,

    organization: data.organization || "NO",
    org_type:
      data.organization && data.organization !== "NO"
        ? data.org_type || "ACTIVE"
        : null,
  };
  if (data.has_2002 !== "true") {
  formatted.roll_no_2002 = null;
}


  // 🎓 flatten education
  if (Array.isArray(data.educations) && data.educations.length > 0) {
    const edu = data.educations[0];
    formatted.education = edu.education || null;
    formatted.education_status = edu.education_status || null;
    formatted.subject_stream = edu.education_stream || null;
  }

  // 🧼 convert empty strings → null
  Object.keys(formatted).forEach((key) => {
    if (formatted[key] === "") formatted[key] = null;
  });

  try {
    const url = isEditable
      ? `${API_BASE_URL}/api/members/${memberData.id}/`
      : `${API_BASE_URL}/api/members/`;

    const response = await fetch(url, {
      method: isEditable ? "PATCH" : "POST",   // ✅ PATCH instead of PUT
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formatted),
    });

    if (!response.ok) {
  const errData = await response.json();
  console.error("❌ Backend error:", errData);

  let message = "Failed to save member";

  if (typeof errData === "string") {
    message = errData;
  } else if (typeof errData === "object") {
    message = Object.entries(errData)
      .map(([field, msgs]) =>
        Array.isArray(msgs)
          ? `${field}: ${msgs.join(", ")}`
          : `${field}: ${msgs}`
      )
      .join(" | ");
  }

  throw new Error(message); // 🔥 real error pass cheyyunnu
}

    toast.success(isEditable ? "Member updated successfully" : "Member added successfully");

if (typeof onSuccess === "function") {
  onSuccess();   // refresh list
}

if (typeof onClose === "function") {
  // modal mode
  onClose();
} else {
  // page mode
  navigate(-1);   // 👈 BACK
}     // ❌ close modal
  } catch (err) {
  console.error("Save failed:", err);
  toast.error(err.message || "Failed to save member");
}

};

useEffect(() => {
  const fetchFamilies = async () => {
    try {
      const res = await api.get("families/");
      setFamiliesList(res.data);
    } catch (err) {
      console.error("Failed to fetch families", err);
    }
  };

  // only fetch if prop empty
  if (!families || families.length === 0) {
    fetchFamilies();
  }
}, [families]);


  const renderField = (label, name, type = "text", children = null, extra = {}) => (
    <Col md={6} className="mb-2">
      {children ? (
        <FormInput
          label={label}
          name={name}
          type={type}
          register={register}
          errors={errors}
          control={control}
          {...extra}
        >
          {children}
        </FormInput>
      ) : (
        <FormInput
          label={label}
          name={name}
          type={type}
          register={register}
          errors={errors}
          control={control}
        />
      )}
    </Col>
  );

  const tabs = ["basic", "family", "education", "job", "political", "health"];

  const familySource =
  families && families.length > 0 ? families : familiesList;

const familyOptions = familySource.map((f) => ({
  value: f.id,
  label: `${f.family_name_en} / ${f.family_name_ml} (${f.h_no}${f.sub ? " " + f.sub.toUpperCase() : ""})`,
}));



  return (
    <div className="container-fluid py-3 bg-light">
      <div className="d-flex justify-content-between align-items-center mb-3">
  <h4>{isEditable ? "✏️ Edit Member" : "➕ Add Member"}</h4>

  {!isEditable && (
    <Button variant="outline-secondary" onClick={() => navigate(-1)}>
      ← Back
    </Button>
  )}
</div>

      <div className="card p-3 shadow-sm">
        <Nav
          variant="tabs"
          className="mb-3 d-flex text-center w-100 border-bottom"
          style={{
            display: "flex",
            justifyContent: "space-around",
            flexWrap: "nowrap",
            borderBottom: "1px solid #dee2e6",
            gap: "4px",
          }}
        >
          {[
            { key: "basic", label: "Basic Details", ml: "അടിസ്ഥാന വിവരം" },
            { key: "family", label: "Family Details", ml: "കുടുംബ വിവരം" },
            { key: "education", label: "Education", ml: "വിദ്യാഭ്യാസം" },
            { key: "job", label: "Job Details", ml: "തൊഴിൽ വിവരങ്ങൾ" },
            { key: "political", label: "Political", ml: "രാഷ്ട്രീയം" },
            { key: "health", label: "Health", ml: "ആരോഗ്യം" },
          ].map((tab) => (
            <Nav.Item key={tab.key} className="flex-fill text-center">
              <Nav.Link
                eventKey={tab.key}
                onClick={() => setActiveSection(tab.key)}
                style={{
                  position: "relative",
                  background: "transparent",
                  color: activeSection === tab.key ? "#007bff" : "#495057",
                  fontWeight: 500,
                  padding: "0.5rem 0",
                  border: "none",
                  borderRadius: 0,
                  transition: "color 0.2s ease-in-out",
                }}
              >
                <div>{tab.label}</div>
                <div
                  className="text-muted"
                  style={{
                    fontSize: "0.82rem",
                    marginTop: "3px",
                    lineHeight: "1.2",
                    whiteSpace: "nowrap",
                  }}
                >
                  {tab.ml}
                </div>
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: "10%",
                    width: activeSection === tab.key ? "80%" : "0%",
                    height: "2.5px",
                    backgroundColor: "#007bff",
                    transition: "width 0.3s ease-in-out",
                    borderRadius: "2px",
                  }}
                />
              </Nav.Link>
            </Nav.Item>
          ))}
        </Nav>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Row className="gy-2">
            {/* BASIC */}
            {activeSection === "basic" && (
              <>
                <Col md={6}>
                  <FormInput
                    label="Name (English)"
                    name="m_name_en"
                    type="text"
                    register={register}
                    errors={errors}
                    control={control}
                    onChange={(e) => setValue("m_name_en", capitalizeFirst(e.target.value))}
                  />
                </Col>
                <Col md={6}>
                  <MalayalamSuggestInput
                    label="Name (Malayalam)"
                    name="m_name_ml"
                    register={register}
                    setValue={setValue}
                    errors={errors}
                    control={control}
                  />
                </Col>

                <Col md={6} style={{ marginTop: "-10px" }}>
  <label className="form-label">Family</label>

  <Select
    options={familyOptions}
    isSearchable
    placeholder="Search family..."
    value={familyOptions.find(
      (opt) => String(opt.value) === String(watch("family"))
    )}
    onChange={(selected) => {
      setValue("family", selected ? selected.value : "");
    }}
    classNamePrefix="react-select"
  />

  {errors.family && (
    <div className="text-danger">{errors.family.message}</div>
  )}
</Col>

                <Col md={6} style={{ marginTop: "-10px" }}>
                                  <FormInput
                                    label="Gender"
                                    name="m_gender"
                                    type="select"
                                    register={register}
                                    errors={errors}
                                    control={control}
                                  >
                                    <option value="">Select</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="F">F</option>
                                    <option value="M">M</option>
                                    <option value="other">Other</option>
                                  </FormInput>
                                </Col>
                
                                <Col md={6}>
                                  <FormInput
                                    label="Date of Birth"
                                    name="date_of_birth"
                                    type="date"
                                    register={register}
                                    errors={errors}
                                    control={control}
                                  />
                                </Col>
                
                                <Col md={6}>
                                  <FormInput
                                    label="Age"
                                    name="m_age"
                                    type="number"
                                    register={register}
                                    errors={errors}
                                    control={control}
                                    readOnly
                                  />
                                </Col>
                
                                <Col md={6}>
                                  <FormInput
                                    label="Phone"
                                    name="phone_no"
                                    type="text"
                                    register={register}
                                    errors={errors}
                                    control={control}
                                  />
                                </Col>
                
                                <Col md={6}>
                                  <FormInput
                                    label="Relation"
                                    name="m_relation"
                                    type="select"
                                    register={register}
                                    errors={errors}
                                    control={control}
                                  >
                                    <option value="">Select</option>
                                    <option value="wife">Wife</option>
                                    <option value="husband">Husband</option>
                                    <option value="mother">Mother</option>
                                    <option value="father">Father</option>
                                    <option value="son">Son</option>
                                    <option value="daughter">Daughter</option>
                                  </FormInput>
                                </Col>
                
                                <Col md={6}>
                                  <label className="form-label">Marital Status</label>
                                  <select
                                    className="form-select"
                                    {...register("marital_status", { required: "Marital status is required" })}
                                  >
                                    <option value="">-- Select --</option>
                                    <option value="single">Single</option>
                                    <option value="married">Married</option>
                                    <option value="widowed">Widowed</option>
                                    <option value="divorced">Divorced</option>
                                  </select>
                                  {errors.marital_status && <div className="text-danger">{errors.marital_status.message}</div>}
                                </Col>
                
                                <Col md={6}>
                                  <FormInput
                                    label="Blood Group"
                                    name="blood_grp"
                                    type="select"
                                    register={register}
                                    errors={errors}
                                    control={control}
                                  >
                                    <option value="">Select</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                  </FormInput>
                                </Col>
                              </>
                            )}
                {/* ... other basic fields ... */}
              

            {/* FAMILY */}
            {activeSection === "family" && (
              <>
                

                <Col md={6} style={{ marginTop: "-10px" }}>
                  <FormInput
                    label="House Owner"
                    name="owner_name"
                    type="text"
                    register={register}
                    control={control}
                    readOnly
                    placeholder="Auto-filled from family"
                  />
                </Col>

    <Col md={6}>
      <FormInput
        label="Religion"
        name="religion"
        type="select"
        register={register}
        errors={errors}
        control={control}
      >
        <option value="">Select</option>
        <option value="Islam">Islam</option>
        <option value="Hindu">Hindu</option>
        <option value="Christian">Christian</option>
      </FormInput>
    </Col>

    {watch("religion") === "Hindu" && (
      <Col md={6}>
        <FormInput
          label="Caste"
          name="caste"
          type="select"
          register={register}
          errors={errors}
          control={control}
        >
          <option value="">Select</option>
          <option value="SC">SC</option>
          <option value="ST">ST</option>
          <option value="OBC">OBC</option>
          <option value="General">General</option>
        </FormInput>
      </Col>
    )}
  </>
)}


                {/* Education list */}
                {/* EDUCATION */}
{activeSection === "education" && (
  <>
    {fields.map((item, index) => {
      const selectedEducation = watch(`educations.${index}.education`);
      const isLast = index === fields.length - 1;

      return (
        <Row key={item.id} className="align-items-end mb-2">
          {/* Education */}
          <Col md={4}>
            <label className="form-label">Education</label>
            <select
              {...register(`educations.${index}.education`)}
              className="form-select"
            >
              <option value="">Select</option>
              <option value="10th">10th</option>
              <option value="+1">+1</option>
              <option value="+2">+2</option>
              <option value="UG">UG</option>
              <option value="PG">PG</option>
              <option value="PhD">PhD</option>
            </select>
            {errors.educations?.[index]?.education && (
              <div className="text-danger">
                {errors.educations[index].education.message}
              </div>
            )}
          </Col>

          {/* Stream (only for certain levels) */}
          {["+1", "+2", "UG", "PG", "PhD"].includes(selectedEducation) && (
            <Col md={4}>
              <label className="form-label">Stream</label>
              <select
                {...register(`educations.${index}.education_stream`)}
                className="form-select"
              >
                <option value="">Select Stream</option>
                <option value="Science">Science</option>
                <option value="Commerce">Commerce</option>
                <option value="Humanities">Humanities</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Arts">Arts</option>
                <option value="Engineering">Engineering</option>
                <option value="Medical">Medical</option>
                <option value="Law">Law</option>
                <option value="Management">Management</option>
                <option value="Others">Others</option>
                
              </select>
              {errors.educations?.[index]?.education_stream && (
                <div className="text-danger">
                  {errors.educations[index].education_stream.message}
                </div>
              )}
            </Col>
          )}

          {/* Status */}
          <Col md={3}>
            <label className="form-label">Status</label>
            <select
              {...register(`educations.${index}.education_status`)}
              className="form-select"
            >
              <option value="">Select</option>
              <option value="studying">Studying</option>
              <option value="passed">Passed</option>
              <option value="failed">Failed</option>
            </select>
            {errors.educations?.[index]?.education_status && (
              <div className="text-danger">
                {errors.educations[index].education_status.message}
              </div>
            )}
          </Col>

          {/* Buttons (Add / Remove) */}
<Col
  md={1}
  className="d-flex align-items-center justify-content-center"
  style={{ marginTop: "32px" }}
>

            {/* Show delete button if more than one row */}
            {fields.length > 1 && (
<Button
  type="button"
  variant="outline-danger"
  onClick={() => remove(index)}
  style={{ width: "40px", height: "38px", display: "flex", alignItems: "center", justifyContent: "center" }}
>
  🗑️
</Button>
            )}

            {/* Always show add button on last row */}
            {isLast && (
<Button
  type="button"
  variant="outline-primary"
  className="btn-square"
  onClick={() =>
    append({
      education: "",
      education_stream: "",
      education_status: "",
    })
  }
>
  +
</Button>

            )}
          </Col>
        </Row>
      );
    })}
  </>
)}


            {/* JOB */}
            {activeSection === "job" && (
              <>
                <Col md={6}>
                  <label className="form-label d-block">Job Status</label>
                  <div>
                    <div className="form-check form-check-inline">
                      <input className="form-check-input" type="radio" id="jobYes" value="true" {...register("job_status")} />
                      <label className="form-check-label" htmlFor="jobYes">Yes</label>
                    </div>
                    <div className="form-check form-check-inline">
                      <input className="form-check-input" type="radio" id="jobNo" value="false" {...register("job_status")} />
                      <label className="form-check-label" htmlFor="jobNo">No</label>
                    </div>
                  </div>
                  {errors.job_status && <div className="text-danger">{errors.job_status.message}</div>}
                </Col>

                {jobStatus === "true" && (
                  <>
                    <Col md={6}>
                      <FormInput label="Job Country" name="job_country" type="select" register={register} errors={errors} control={control}>
                        <option value="">Select</option>
                        <option value="Govt">Govt</option>
                        <option value="Private">Private</option>
                        <option value="Abroad">Abroad</option>
                        <option value="Abroad">Business</option>
                        <option value="Labor">Labor</option>
                      </FormInput>
                    </Col>

                    <Col md={6}>
                      <FormInput label="Monthly Income" name="monthly_income" type="text" register={register} errors={errors} control={control} />
                    </Col>

                  </>
                )}
                
                    <Col md={6}>
                      <FormInput label="Organization" name="organization" type="select" register={register} errors={errors} control={control}>
                        <option value="">Select</option>
                        <option value="NO">NO</option>
                        <option value="EK">EK</option>
                        <option value="AP">AP</option>
                        <option value="MUJAHID">MUJAHID</option>
                        <option value="JAMAD">JAMAD</option>
                      </FormInput>
                    </Col>

                    {organization && organization !== "NO" && (
                      <Col md={6}>
                        <FormInput label="Organization Type" name="org_type" type="select" register={register} errors={errors} control={control}>
                          <option value="">Select</option>
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="ASSOCIATIVE">ASSOCIATIVE</option>
                        </FormInput>
                      </Col>
                    )}
              </>
            )}

            {/* POLITICAL */}
            {activeSection === "political" && (
              <>
                <Col md={6}>
                  <label className="form-label d-block">Election ID</label>
                  <div>
                    <div className="form-check form-check-inline">
                      <input className="form-check-input" type="radio" id="eYes" value="true" {...register("election_id")} />
                      <label className="form-check-label" htmlFor="eYes">Yes</label>
                    </div>
                    <div className="form-check form-check-inline">
                      <input className="form-check-input" type="radio" id="eNo" value="false" {...register("election_id")} />
                      <label className="form-check-label" htmlFor="eNo">No</label>
                    </div>
                  </div>
                </Col>

                {electionId === "true" && (
                  <>
                    <Col md={6}>
                      <FormInput label="RollNo SEC" name="roll_no_sec" type="text" register={register} errors={errors} control={control} />
                    </Col>
                     <Col md={6}>
                      <FormInput label="SEC ID" name="voter_id_number" type="text" register={register} errors={errors} control={control} />
                    </Col>
                     <Col md={6}>
                      <FormInput label="RollNo CEO" name="roll_no_ceo" type="text" register={register} errors={errors} control={control} />
                    </Col>
                     <Col md={6}>
                      <FormInput label="Epic ID" name="epic_id" type="text" register={register} errors={errors} control={control} />
                    </Col>
                    <Col md={6}>
  <label className="form-label d-block">SIR 2002</label>
  <div>
    <div className="form-check form-check-inline">
      <input
        className="form-check-input"
        type="radio"
        value="true"
        {...register("has_2002")}
      />
      <label className="form-check-label">Yes</label>
    </div>

    <div className="form-check form-check-inline">
      <input
        className="form-check-input"
        type="radio"
        value="false"
        {...register("has_2002")}
      />
      <label className="form-check-label">No</label>
    </div>
  </div>
</Col>

{/* 👇 SHOW ONLY IF YES */}
{watch("has_2002") === "true" && (
  <Col md={6}>
    <FormInput
      label="Roll No-2002"
      name="roll_no_2002"
      type="text"
      register={register}
      errors={errors}
      control={control}
    />
  </Col>
)}

                     <Col md={6}>
                      <FormInput label="Roll No-2025" name="roll_no_2025" type="text" register={register} errors={errors} control={control} />
                    </Col>
                      
                   
                    <Col md={6}>
                      <FormInput label="Guardian's Name(EN)" name="guardian_en" type="text" register={register} errors={errors} control={control} />
                    </Col>
                     <Col md={6}>
                      <FormInput label="Guardian's Name(ML)" name="guardian_ml" type="text" register={register} errors={errors} control={control} />
                    </Col>
                     <Col md={6}>
                      <FormInput label="Relation" name="g_relation" type="text" register={register} errors={errors} control={control} />
                    </Col>

                    <Col md={6}>
  <Form.Group>
  <Form.Label>Ward</Form.Label>

  <select
    className="form-select"
    {...register("ward")}
  >
    <option value="">-- Select Ward --</option>

    {wards.flatMap((w) =>
      Array.isArray(w.ward)
        ? w.ward.map((singleWard, idx) => (
            <option
              key={`${w.id}-${idx}`}
              value={singleWard}
            >
              {singleWard}
            </option>
          ))
        : []
    )}
  </select>
</Form.Group>

</Col>


                    {/* === Constituency dropdown (visible) === */}
                    <Col md={6}>
  <Form.Group>
    <Form.Label>Constituency</Form.Label>

    <Form.Select
  {...register("constituency_id")}
  value={watch("constituency_id") || ""}   // ✅ correct binding
  onChange={(e) => {
    setValue("constituency_id", e.target.value);
  }}
>
  <option value="">-- Select Constituency --</option>

  {Array.from(
    new Map(
      wards.map((w) => [
        String(w.id),                 // ✅ constituency REAL id from DB
        { id: w.id, name: w.constituency }
      ])
    ).values()
  ).map((c) => (
    <option key={c.id} value={c.id}>
      {c.name}
    </option>
  ))}
</Form.Select>


  </Form.Group>
</Col>

                    {/* hidden ward_id (not shown to user) */}
                   

                    <Col md={6}>
                      <Form.Group>
  <Form.Label>Polling Booth</Form.Label>
<Form.Select {...register("polling_booth_no")}>
  <option value="">Select Booth</option>

  {pollingBooths?.map((item) => (
    <option
      key={item.id}
      value={`${item.polling_booth_no} - ${item.booth_name}`} // ✅ value matches DB saved format
    >
      {item.polling_booth_no} - {item.booth_name}
    </option>
  ))}
</Form.Select>



</Form.Group>

                    </Col>
                  </>
                )}

                <Col md={6}>
                  <FormInput label="Political Party" name="political_party" type="select" register={register} errors={errors} control={control}>
                    <option value="">Select</option>
                    <option value="NO">NO</option>
                    <option value="CPI">CPI</option>
                    <option value="CONGRESS">CONGRESS</option>
                    <option value="CPM">CPM</option>
                    <option value="BJP">BJP</option>
                    <option value="WPI">WPI</option>
                  </FormInput>
                </Col>
              </>
            )}

            {/* HEALTH */}
            {activeSection === "health" && (
              <>
                <Col md={6}>
                  <label className="form-label d-block">Pension</label>
                  <div>
                    <div className="form-check form-check-inline">
                      <input className="form-check-input" type="radio" id="pYes" value="true" {...register("m_pension")} />
                      <label className="form-check-label" htmlFor="pYes">Yes</label>
                    </div>
                    <div className="form-check form-check-inline">
                      <input className="form-check-input" type="radio" id="pNo" value="false" {...register("m_pension")} />
                      <label className="form-check-label" htmlFor="pNo">No</label>
                    </div>
                  </div>
                  {errors.m_pension && <div className="text-danger">{errors.m_pension.message}</div>}
                </Col>

                {pensionStatus === "true" && (
                  <Col md={6}>
                    <FormInput label="Pension Type" name="pension_type" type="select" register={register} errors={errors} control={control}>
                      <option value="">Select</option>
                      <option value="OLD AGE">OLD AGE</option>
                      <option value="DISABILITY">DISABILITY</option>
                      <option value="WIDOW">WIDOW</option>
                    </FormInput>
                  </Col>
                )}

                <Col md={6}>
                  <label className="form-label d-block">Chronic Disease</label>
                  <div>
                    <div className="form-check form-check-inline">
                      <input className="form-check-input" type="radio" id="chYes" value="true" {...register("has_chronic_disease")} />
                      <label className="form-check-label" htmlFor="chYes">Yes</label>
                    </div>
                    <div className="form-check form-check-inline">
                      <input className="form-check-input" type="radio" id="chNo" value="false" {...register("has_chronic_disease")} />
                      <label className="form-check-label" htmlFor="chNo">No</label>
                    </div>
                  </div>
                  {errors.has_chronic_disease && <div className="text-danger">{errors.has_chronic_disease.message}</div>}
                </Col>

                {chronicStatus === "true" && (
                  <Col md={6}>
                    <FormInput label="Specify Disease" name="chronic_disease" type="text" register={register} errors={errors} control={control} />
                  </Col>
                )}

                <Col md={6}>
                  <label className="form-label d-block">Disability</label>
                  <div>
                    <div className="form-check form-check-inline">
                      <input className="form-check-input" type="radio" id="disYes" value="true" {...register("m_disability")} />
                      <label className="form-check-label" htmlFor="disYes">Yes</label>
                    </div>
                    <div className="form-check form-check-inline">
                      <input className="form-check-input" type="radio" id="disNo" value="false" {...register("m_disability")} />
                      <label className="form-check-label" htmlFor="disNo">No</label>
                    </div>
                  </div>
                </Col>

                <Col md={6}>
                  <label className="form-label d-block">Health Insurance</label>
                  <div>
                    <div className="form-check form-check-inline">
                      <input className="form-check-input" type="radio" id="insYes" value="true" {...register("m_health_insurance")} />
                      <label className="form-check-label" htmlFor="insYes">Yes</label>
                    </div>
                    <div className="form-check form-check-inline">
                      <input className="form-check-input" type="radio" id="insNo" value="false" {...register("m_health_insurance")} />
                      <label className="form-check-label" htmlFor="insNo">No</label>
                    </div>
                  </div>
                </Col>
              </>
            )}

            {/* Buttons */}

  {/* ==== Navigation Buttons (Next / Previous / Save) ==== */}
<Col xs={12} className="mt-4 d-flex justify-content-between">
  {/* Previous Button */}
  {activeSection !== "basic" ? (
    <Button
      variant="outline-secondary"
      onClick={() => {
        const currentIndex = tabs.indexOf(activeSection);
        setActiveSection(tabs[currentIndex - 1]);
      }}
    >
      ← Previous
    </Button>
  ) : (
    <div></div>
  )}

  {/* Next or Save */}
  {activeSection !== "health" ? (
    <Button
      variant="primary"
      onClick={() => {
        const currentIndex = tabs.indexOf(activeSection);
        setActiveSection(tabs[currentIndex + 1]);
      }}
    >
      Next →
    </Button>
  ) : (
    <div className="d-flex gap-2">
      <Button variant="secondary" onClick={onClose}>
        Close
      </Button>
      <Button type="submit" variant="success">
        {isEditable ? "Update" : "Save"}
      </Button>
    </div>
  )}
</Col>



          
          </Row>
        </form>
     </div>
</div>
  );
};

export default AddEditMember;
