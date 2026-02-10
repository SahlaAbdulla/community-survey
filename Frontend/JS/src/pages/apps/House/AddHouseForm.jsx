import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Modal, Row, Col, Button, Nav, Tab, Form } from "react-bootstrap";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { FormInput } from "../../../components";
import { toast } from "react-toastify";
import MalayalamSuggestInput from "../../../components/MalayalamSuggestInput";
import Select from "react-select";
import AddEditMember from "../Member/AddEditMember";
import { useNavigate } from "react-router-dom";




const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const capitalizeFirstLetter = (value) => {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
};


const roadOptions = [
  { value: "PWD Road", label: "PWD Road (പിഡബ്ല്യുഡി റോഡ്)" },
  { value: "Tar", label: "Tar (ടാർ റോഡ്)" },
  { value: "Mud", label: "Mud (മണ്ണ് റോഡ്)" },
  { value: "Panchayath Road", label: "Panchayath Road (പഞ്ചായത്ത് റോഡ്)" },
  { value: "No Road", label: "No Road (റോഡ് ഇല്ല)" },
  { value: "Other", label: "Other" },
];



const AddHouseForm = ({
  isOpen,
  onClose,
  isEditable,
  houseData,
  onUpdateHouse,
  onAddHouse,
  families,
  showBackButton = true, // 👈 default
  houses,
}) => {
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [members, setMembers] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [activeTab, setActiveTab] = useState("basic");
  const [showAddMember, setShowAddMember] = useState(false);
  const [ownerList, setOwnerList] = useState([]);
  const [selectedOwner, setSelectedOwner] = useState("");



  // ✅ Validation Schema
  const schemaResolver = yupResolver(
  yup.object().shape({
    // ✅ Basic Required Fields
    owner_en: yup.string().nullable().notRequired(),
    owner_ml: yup.string().nullable().notRequired(),
    family: yup.string().nullable().notRequired(),
    cluster: yup.string().nullable().notRequired(),
    h_address: yup.string().nullable().notRequired(),

    // ✅ Optional but conditional validations
    phone_no: yup
      .string()
      .nullable()
      .transform((value) => (value === "" ? null : value))
      .matches(/^[0-9]{10}$/, "Enter a valid 10-digit phone number")
      .notRequired(),

    h_status: yup.string().nullable().notRequired(),
    h_status_other: yup
      .string()
      .nullable()
      .when("h_status", {
        is: "Other",
        then: (schema) => schema.required("Please enter new house status"),
        otherwise: (schema) => schema.nullable().notRequired(),
      }),

    h_type: yup.string().nullable().notRequired(),
    h_type_other: yup
      .string()
      .nullable()
      .when("h_type", {
        is: "Other",
        then: (schema) => schema.required("Please enter new house type"),
        otherwise: (schema) => schema.nullable().notRequired(),
      }),

    financial_status: yup.string().nullable().notRequired(),
    land: yup.string().nullable().notRequired(),

    // ✅ Facilities
    has_water_source: yup.string().nullable().notRequired(),
    w_source: yup
      .string()
      .nullable()
      .when("has_water_source", {
        is: (val) => val === "true" || val === "false",
        then: (schema) => schema.required("Select water source"),
        otherwise: (schema) => schema.nullable().notRequired(),
      }),
    water_yes_other: yup
      .string()
      .nullable()
      .when("w_source", {
        is: "Other",
        then: (schema) => schema.required("Please specify"),
        otherwise: (schema) => schema.nullable().notRequired(),
      }),
    water_no_other: yup
      .string()
      .nullable()
      .when("w_source", {
        is: "Other",
        then: (schema) => schema.required("Please specify"),
        otherwise: (schema) => schema.nullable().notRequired(),
      }),

    g_connection: yup.string().nullable().notRequired(),
    biogas: yup.string().nullable().notRequired(),
    solar: yup.string().nullable().notRequired(),
    h_electricity: yup.string().nullable().notRequired(),
    h_refrigerator: yup.string().nullable().notRequired(),
    h_washing_machine: yup.string().nullable().notRequired(),
    h_toilet: yup.string().nullable().notRequired(),

    waste_disposal_method: yup.string().nullable().notRequired(),
    waste_disposal_method_other: yup
      .string()
      .nullable()
      .when("waste_disposal_method", {
        is: "Other",
        then: (schema) => schema.required("Please specify"),
        otherwise: (schema) => schema.nullable().notRequired(),
      }),

    road_access_type: yup.string().nullable().notRequired(),
    road_access_type_other: yup
      .string()
      .nullable()
      .when("road_access_type", {
        is: "Other",
        then: (schema) => schema.required("Please specify"),
        otherwise: (schema) => schema.nullable().notRequired(),
      }),

    // ✅ Agriculture & Livestock
    h_agriculture: yup.string().nullable().notRequired(),
    agriculture_type: yup
      .string()
      .nullable()
      .when("h_agriculture", {
        is: "true",
        then: (schema) => schema.required("Select agriculture type"),
        otherwise: (schema) => schema.nullable().notRequired(),
      }),
    agriculture_type_other: yup
      .string()
      .nullable()
      .when("agriculture_type", {
        is: "Other",
        then: (schema) => schema.required("Please specify agriculture type"),
        otherwise: (schema) => schema.nullable().notRequired(),
      }),

    h_livestock: yup.string().nullable().notRequired(),
    livestock_type: yup
      .string()
      .nullable()
      .when("h_livestock", {
        is: "true",
        then: (schema) => schema.required("Enter livestock type"),
        otherwise: (schema) => schema.nullable().notRequired(),
      }),
    livestock_type_other: yup
      .string()
      .nullable()
      .when("livestock_type", {
        is: "Other",
        then: (schema) => schema.required("Please specify livestock type"),
        otherwise: (schema) => schema.nullable().notRequired(),
      }),
    livestock_count: yup
      .number()
      .nullable()
      .when("h_livestock", {
        is: "true",
        then: (schema) =>
          schema
            .required("Enter livestock count")
            .typeError("Livestock count must be a number")
            .min(1, "Must be at least 1"),
        otherwise: (schema) => schema.nullable().notRequired(),
      }),

    // ✅ Ration Card
    ration_card: yup.string().nullable().notRequired(),
    ration_card_number: yup
      .string()
      .nullable()
      .when("ration_card", {
        is: "true",
        then: (schema) => schema.required("Enter ration card number"),
        otherwise: (schema) => schema.nullable().notRequired(),
      }),
    ration_card_category: yup
      .string()
      .nullable()
      .when("ration_card", {
        is: "true",
        then: (schema) => schema.required("Select ration card category"),
        otherwise: (schema) => schema.nullable().notRequired(),
      }),

    // ✅ Optional remark
    remark: yup.string().nullable().notRequired(),
  })
);


const navigate = useNavigate();


  const {
    handleSubmit,
    register,
    control,
    watch,
    formState: { errors },
    reset,
    setValue,
  } = useForm({ resolver: schemaResolver });

  const rationCardValue = watch("ration_card");
  const agricultureValue = watch("h_agriculture");
  const livestockValue = watch("h_livestock");
  const hasWaterSource = watch("has_water_source");

    // ✅ Add this right below these lines
  useEffect(() => {
    // Whenever 'has_water_source' changes, clear the previous selection
    setValue("w_source", "");
  }, [hasWaterSource, setValue]);

  // ✅ Fetch Clusters
  useEffect(() => {
    const fetchClusters = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/clusters/`);
        const data = await res.json();
        setClusters(data);
      } catch (error) {
        console.error("❌ Failed to fetch clusters:", error);
        toast.error("Failed to load clusters");
      }
    };
    fetchClusters();
  }, []);

  // ✅ FIX: prefill cluster AFTER clusters are loaded (EDIT MODE)
useEffect(() => {
  if (
    isEditable &&
    houseData &&
    clusters.length > 0 &&
    houseData.cluster
  ) {
    const clusterId =
      houseData.cluster?.id || houseData.cluster;

    setValue("cluster", String(clusterId));
  }
}, [clusters, houseData, isEditable, setValue]);


  // ✅ Fetch Family Members
  const handleFamilyChange = async (e) => {
    const familyId = e.target.value;
    setSelectedFamily(familyId);

    if (familyId) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/members?family=${familyId}`);

        const data = await res.json();
        setMembers(data);

        const familyRes = await fetch(`${API_BASE_URL}/api/families/${familyId}`);
        const familyData = await familyRes.json();

        // ✅ Only auto-fill owner when ADDING house
if (!isEditable) {
  if (familyData?.owner_en) {
    setValue("owner_en", familyData.owner_en);
    setValue("owner_ml", familyData.owner_ml);
  } else {
    setValue("owner_en", "");
    setValue("owner_ml", "");
  }
}

      } catch (error) {
        console.error("❌ Failed to fetch family or members:", error);
        setMembers([]);
      }
    } else {
      setMembers([]);
      setValue("owner_en", "");
      setValue("owner_ml", "");
    }
  };

  // ✅ Reset or Prefill Form
  useEffect(() => {
  if (!isOpen) return;

  console.log("🏠 House Data received:", houseData);
  console.log("Members:", members);
  console.log("Owner EN:", watch("owner_en"));
  console.log("Selected Family:", selectedFamily);
  console.log("EDIT HOUSE DATA:", houseData);

  if (houseData) {
    console.log("EDIT FAMILY:", houseData.family);
  }

  if (isEditable && houseData) {
    const familyId = houseData.family?.id || houseData.family || "";

    

    reset({
      ...houseData,
      family: familyId,
      cluster: houseData.cluster?.id || houseData.cluster || "",
    });

    setSelectedFamily(familyId);

    // 🔥 VERY IMPORTANT
    if (familyId) {
      handleFamilyChange({ target: { value: familyId } });
    }
  } else {
    reset({
      owner_en: "",
      owner_ml: "",
      family: "",
      cluster: "",
      h_address: "",
      phone_no: "",
      w_source: "",
      biogas: "",
      solar: "",
      g_connection: "",
      h_electricity: "",
      h_refrigerator: "",
      h_washing_machine: "",
      waste_disposal_method: "",
      h_type: "",
      remark: "",
      h_status: "",
      land: "",
      livestock_type_other: "",
      financial_status: "",
      h_toilet: "",
      road_access_type: "PWD Road",
      h_agriculture: "",
      agriculture_type: "",
      agriculture_type_other: "",
      h_livestock: "",
      ration_card: "",
    });

    setSelectedFamily(null);
    setMembers([]);
  }
}, [isOpen, houseData]);


  // ✅ Submit Handler
  const onSubmitHouse = async (data) => {
    const formattedData = {
      ...data,
      family: Number(data.family),
      cluster: Number(data.cluster), // ✅ FIX
      h_electricity: data.h_electricity === "true",
      h_refrigerator: data.h_refrigerator === "true",
      h_washing_machine: data.h_washing_machine === "true",
      h_toilet: data.h_toilet === "true",
      h_agriculture: data.h_agriculture === "true",
      h_livestock: data.h_livestock === "true",
      g_connection: data.g_connection === "true",
      biogas: data.biogas === "true",
      solar: data.solar === "true",
      ration_card: data.ration_card === "true",
    };

    console.log("📤 House Form Data being sent:", formattedData); // 👈 Add this line

    try {
    if (isEditable) {
      await onUpdateHouse(formattedData);
      toast.success("✅ House updated successfully!");
    } else {
      await onAddHouse(formattedData);
      toast.success("🏠 New house added successfully!");
    }

    // 🚀 REDIRECT AFTER SUCCESS
    navigate("/apps/house");

  } catch (error) {
    console.error("❌ Error submitting house form:", error);
    toast.error("Something went wrong. Please try again!");
  }
};

  // ✅ Reusable Yes/No Select
  const YesNoSelect = ({ label, name }) => (
    <FormInput label={label} name={name} type="select" register={register} errors={errors}>
      <option value="">Select (തിരഞ്ഞെടുക്കുക)</option>
      <option value="true">Yes (ഉണ്ട്)</option>
      <option value="false">No (ഇല്ല)</option>
    </FormInput>
  );

  // Extract all previously added family IDs
const addedFamilies = (houses?.map((h) => Number(h.family)) || []);



  // inside AddEditMember component — before return()

const familyOptions = families?.map((fam) => {
  const isAlreadyAdded = addedFamilies.includes(Number(fam.id));

  const baseLabel = `${fam.family_name_en} / ${fam.family_name_ml} (${fam.h_no}${
  fam.sub ? `/${fam.sub}` : ""
})`;

  return {
    value: fam.id,
    label: isAlreadyAdded ? `✓ ${baseLabel} — Added` : baseLabel,
    isDisabled: isAlreadyAdded,
  };
});





 return (
  <>
  <style>
      {`
        .simple-tabs .nav-link {
          border: none !important;
          background: transparent !important;
          color: #6c757d;
          font-weight: 500;
          padding: 14px 10px;
        }

        .simple-tabs .nav-link.active {
          color: #0d6efd !important;
          border-bottom: 3px solid #0d6efd !important;
          background: transparent !important;
        }

        .simple-tabs .nav-item {
          flex: 1;
          text-align: center;
        }
      `}
    </style>
    
    <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
      {/* ---------- HEADER ---------- */}
      <div >
  <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">

    {/* 🔙 Back Button */}
   {showBackButton && (
  <button
    className="btn btn-outline-secondary"
    onClick={() => navigate("/apps/house")}
  >
    ← Back to House List
  </button>
)}


    {/* 🏠 Title */}
    <div className="d-flex align-items-center gap-2">
      <span style={{ fontSize: "1.4rem" }}>🏠</span>
      <h5 className="fw-bold mb-0">
        {isEditable ? "Edit House" : "Add House"}
      </h5>
    </div>

  </div>
</div>


      {/* ✅ Correct Nav wrapping */}
<div className="bg-white shadow-sm mt-3 rounded px-3">
  <Nav variant="tabs" className="simple-tabs">
    {[
      { key: "basic", label: "Basic Information", ml: "അടിസ്ഥാന വിവരങ്ങൾ" },
      { key: "facilities", label: "House Facilities", ml: "സൗകര്യങ്ങൾ" },
      { key: "livestock", label: "Other Details", ml: "മറ്റ് വിവരങ്ങൾ" },
      { key: "ration", label: "Ration Card Details", ml: "റേഷൻ കാർഡ് വിവരങ്ങൾ" },
    ].map((tab) => (
      <Nav.Item key={tab.key} className="flex-fill text-center">
        <Nav.Link
          eventKey={tab.key}
          className="rounded-0 py-3"
        >
          <div className="fw-semibold">{tab.label}</div>
          <small className="text-muted">{tab.ml}</small>
        </Nav.Link>
      </Nav.Item>
    ))}
  </Nav>
</div>


    {/* ✅ Scrollable Modal Body */}
<div
        className="bg-light"
        style={{
          minHeight: "calc(100vh - 120px)",
          overflowY: "auto",
          padding: "1.5rem",
        }}
      >
<form noValidate onSubmit={handleSubmit(onSubmitHouse)}>
          <Tab.Content>
              {/* 🏠 Basic Info */}
              <Tab.Pane eventKey="basic">
                <Row className="gy-3 gx-4">


                 <Col md={6}>
  <label className="form-label">Family Name (ഫാമിലി നെയിം)</label>

  <Select
  options={familyOptions}
  isSearchable={true}
  placeholder="Search family..."
  value={familyOptions?.find((f) => f.value === Number(watch("family"))) || null}
  onChange={(selected) => {
    setValue("family", selected?.value || "");
    
    handleFamilyChange({ target: { value: selected?.value } });
  }}
  isOptionDisabled={(option) => option.isDisabled}
  styles={{
    option: (base, state) => ({
      ...base,
      color: state.isDisabled ? "#999" : "#000",
      backgroundColor: state.isDisabled ? "#f7f7f7" : "#fff",
      cursor: state.isDisabled ? "not-allowed" : "pointer",
      paddingLeft: 12,
      fontWeight: state.isDisabled ? "600" : "200", // tick bold
    }),
    menu: (base) => ({ ...base, zIndex: 9999 })
  }}
/>


  {errors.family && (
    <div className="text-danger">{errors.family.message}</div>
  )}
</Col>


<Col md={6}>
 <Form.Group>

<Form.Label>Owner Name (English)</Form.Label>
      <div className="d-flex align-items-center gap-2">

   <select
  {...register("owner_en")}
  className="form-select"
  style={{ backgroundColor: "#fff" }}   // 👈 make background white
  disabled={!selectedFamily}
  value={watch("owner_en") || ""} 
  onChange={(e) => {
    const selectedMember = members.find((m) => m.m_name_en === e.target.value);
    setValue("owner_en", e.target.value);
    setValue("owner_ml", selectedMember?.m_name_ml || "");
  }}
>
  <option value="">
    {selectedFamily ? "Select Owner" : "Select Family first"}
  </option>
  {members.map((m) => (
    <option key={m.id} value={m.m_name_en}>
      {m.m_name_en}
    </option>
  ))}
</select>



{/* <Button
          variant="outline-secondary"
onClick={() => {
  console.log("🧍 Add Member clicked!");
  setShowAddMember(true);
}}
         
          title="Add new member"
        >
          <i className="bi bi-person-plus"></i>
        </Button> */}
      </div>
    </Form.Group>
  </Col>

                  <Col md={6}>
                    <MalayalamSuggestInput
                      label="Owner Name (Malayalam)"
                      name="owner_ml"
                      control={control}
                      register={register}
                      setValue={setValue}
                      errors={errors}
                      value={watch("owner_ml") || ""}
                      placeholder="തിരഞ്ഞെടുക്കുക"
                    />
                  </Col>

                  <Col md={6}>
                    <FormInput
                      label="Contact Number (കോണ്ടാക്ട് നമ്പർ)"
                      name="phone_no"
                      type="text"
                      register={register}
                      errors={errors}
                      control={control}
                    />
                  </Col>

                  <Col md={6}>
                    <FormInput
                      label="Address (അഡ്രെസ്സ്)"
                      name="h_address"
                      type="textarea"
                      register={register}
                      errors={errors}
                      control={control}
                      onChange={(e) =>
                        setValue("h_address", capitalizeFirstLetter(e.target.value))
                      }
                    />
                  </Col>

                  {/* ✅ Cluster Dropdown */}
                  <Col md={6}>
                    <FormInput
                      label="Cluster (ക്ലസ്റ്റർ / പ്രദേശം)"
                      name="cluster"
                      type="select"
                      register={register}
                      errors={errors}
                    >
                       <option value="">Select (തിരഞ്ഞെടുക്കുക)</option>
{clusters?.length > 0 &&
  clusters.map((cluster) => (
    <option key={cluster.id} value={cluster.id}>
      {cluster.name_english} / {cluster.name_malayalam}
    </option>
  ))}
                    </FormInput>
                  </Col>

                  <Col md={6}>
                    <label className="form-label">House Type (വീടിന്റെ തരം)</label>
<Select
  options={[
    { value: "Concrete", label: "Concrete (കോൺക്രീറ്റ്)" },
    { value: "Thatch", label: "Thatch (തട്ട്)" },
    { value: "Asbestos", label: "Asbestos" },
    { value: "Other", label: "Other" },
  ]}
  placeholder="Search or select..."
  isSearchable
  onChange={(opt) => setValue("h_type", opt?.value || "")}
  value={
    ["Concrete", "Thatch", "Asbestos", "Other"]
      .map((v) => ({
        value: v,
        label:
          v === "Concrete"
            ? "Concrete (കോൺക്രീറ്റ്)"
            : v === "Thatch"
            ? "Thatch (തട്ട്)"
            : v === "Asbestos"
            ? "Asbestos"
            : "Other",
      }))
      .find((opt) => opt.value === watch("h_type")) || null
  }
/>

                  </Col>
                  {watch("h_type") === "Other" && (
      <Col md={6}>
        <FormInput
          label="Add New  (വിവരം നൽകുക)"
          name="h_type_other"
          register={register}
          errors={errors}
          placeholder="Type her"
        />
      </Col>
    )}



                  <Col md={6}>
                    <FormInput
                      label="House Status (വീടിന്റെ ഉടമസ്ഥത)"
                      name="h_status"
                      type="select"
                      register={register}
                      errors={errors}
                    >
                       <option value="">Select (തിരഞ്ഞെടുക്കുക)</option>
                      <option value="Own">Own (സ്വന്തം)</option>
                      <option value="Rent">Rent (വാടക)</option>
                      <option value="Outlandish land">Outlandish land (പുറമ്പോക്ക്)</option>
                       <option value="Other">Other</option>
                    </FormInput>
                  </Col>
                   {watch("h_status") === "Other" && (
      <Col md={6}>
        <FormInput
          label="Add New  (വിവരം നൽകുക)"
          name="h_status_other"
          register={register}
          errors={errors}
          placeholder="Type her"
        />
      </Col>
    )}

                 <Col md={6}><YesNoSelect label="Land (സ്വന്തമായി ഭൂമി)" name="land" /></Col>

                                   <Col md={6}>
                    <FormInput
                      label="Financial Status (സാമ്പത്തിക നില)"
                      name="financial_status"
                      type="select"
                      register={register}
                      errors={errors}
                    >
                       <option value="">Select (തിരഞ്ഞെടുക്കുക)</option>
                      <option value="Middle Class">Middle Class (ഇടത്തര)</option>
                      <option value="Lower Class">Lower Class (ഇടത്തരത്തിനു താഴെ )</option>
                      <option value="Upper Class">Upper Class (ഇടത്തരത്തിനു മുകളിൽ )</option>
                    </FormInput>
                  </Col>
                  
                </Row>
                <div className="d-flex justify-content-end mt-4">
      <Button variant="primary" onClick={() => setActiveTab("facilities")}>
        Next →
      </Button>
    </div>
              </Tab.Pane>

              {/* ⚙️ Facilities Tab */}
              <Tab.Pane eventKey="facilities">
  <Row className="gy-3 gx-4">


<Col md={6}>
  <label className="form-label">Road Access Type (റോഡ് ആക്സസ് തരം)</label>
  <Select
    options={roadOptions}
    placeholder="തിരഞ്ഞെടുക്കുക / Search..."
    isSearchable
    {...register("road_access_type")}
    onChange={(selectedOption) =>
      setValue("road_access_type", selectedOption?.value)
    }
    defaultValue={roadOptions.find(
      (opt) => opt.value === watch("road_access_type")
    )}
  />
  {errors.road_access_type && (
    <div className="text-danger">{errors.road_access_type.message}</div>
  )}
</Col>

 {watch("road_access_type") === "Other" && (
      <Col md={6}>
        <FormInput
          label="Add New  (വിവരം നൽകുക)"
          name="road_access_type_other"
          register={register}
          errors={errors}
          placeholder="Type her"
        />
      </Col>
    )}

    <Col md={6}>
  <YesNoSelect label="Water Source Available (ജല ഉറവിടമുണ്ടോ)" name="has_water_source" />
</Col>

{/* ✅ Show this only when Yes or No is selected */}
{hasWaterSource && (
  <Col md={6}>
    <label className="form-label">Water Source (ജല ഉറവിടം)</label>
    <select
      {...register("w_source")}
      className="form-select"
    >
      <option value="">Select (തിരഞ്ഞെടുക്കുക)</option>

      {hasWaterSource === "true" ? (
        <>
          <option value="KWA Pipeline">KWA Pipeline (കെ.ഡബ്ല്യുഎ പൈപ്പ് ലൈൻ)</option>
          <option value="Well">Well (കിണർ)</option>
          <option value="Rainwater Harvesting">Rainwater Harvesting (മഴവെള്ള ശേഖരണം)</option>
          <option value="Other">Other</option>
        </>
      ) : (
        <>
          <option value="Borewell">Borewell (ബോർവെൽ)</option>
          <option value="Tanker">Tanker (ടാങ്കർ വെള്ളം)</option>
          <option value="River">River (നദി)</option>
          <option value="Other">Other</option>
        </>
      )}
    </select>

    {errors.w_source && (
      <div className="text-danger">{errors.w_source.message}</div>
    )}
  </Col>
)}
{watch("w_source") === "Other" && (
      <Col md={6}>
        <FormInput
          label="Add New (വിവരം നൽകുക)"
          name="water_no_other"
          register={register}
          errors={errors}
          placeholder="Type her"
        />
      </Col>
    )}

    {watch("w_source") === "Other" && (
      <Col md={6}>
        <FormInput
          label="Add New (വിവരം നൽകുക)"
          name="water_yes_other"
          register={register}
          errors={errors}
          placeholder="Type her"
        />
      </Col>
    )}

    


    <Col md={6}><YesNoSelect label="Gas Connection (ഗ്യാസ് കണക്ഷൻ)" name="g_connection" /></Col>
    <Col md={6}><YesNoSelect label="Biogas (ബയോ ഗ്യാസ്)" name="biogas" /></Col>
    <Col md={6}><YesNoSelect label="Solar (സോളാർ)" name="solar" /></Col>
    <Col md={6}><YesNoSelect label="Electricity (ഇലക്ട്രിസിറ്റി)" name="h_electricity" /></Col>
    <Col md={6}><YesNoSelect label="Refrigerator (റെഫ്രിജെറേറ്റർ)" name="h_refrigerator" /></Col>
    <Col md={6}><YesNoSelect label="Washing Machine (വാഷിംഗ് മെഷിൻ)" name="h_washing_machine" /></Col>
    <Col md={6}><YesNoSelect label="Toilet (ടോയിലേറ്റ്)" name="h_toilet" /></Col>
    <Col md={6}>
      <FormInput
        label="Waste Disposal Method (മാലിന്യ സംസ്‌കരണ രീതി)"
        name="waste_disposal_method"
        type="select"
        register={register}
        errors={errors}
      >
        
       <option value="">Select (തിരഞ്ഞെടുക്കുക)</option>
  <option value="Burning">Burning (ചുട്ടുകളയുന്നത്)</option>
  <option value="Composting">Composting (കമ്പോസ്റ്റിംഗ്)</option>
  <option value="Municipal Collection">Municipal Collection (മുനിസിപ്പൽ ശേഖരണം)</option>
  <option value="Dumping">Dumping (തള്ളിക്കളയൽ)</option>
  <option value="Other">Other</option>
      </FormInput>
    </Col>
      {watch("waste_disposal_method") === "Other" && (
      <Col md={6}>
        <FormInput
          label="Add New  (വിവരം നൽകുക)"
          name="waste_disposal_method_other"
          register={register}
          errors={errors}
          placeholder="Type her"
        />
      </Col>
    )}
  </Row>
   {/* Navigation Buttons */}
    <div className="d-flex justify-content-between mt-4">
      <Button variant="secondary" onClick={() => setActiveTab("basic")}>
        ← Previous
      </Button>
      <Button variant="primary" onClick={() => setActiveTab("livestock")}>
        Next →
      </Button>
    </div>
</Tab.Pane>

              {/* 🌾 Livestock / Agriculture */}
              <Tab.Pane eventKey="livestock">
  <Row className="gy-3 gx-4">
    <Col md={6}>
      <YesNoSelect label="Livestock" name="h_livestock" />
    </Col>

    {livestockValue === "true" && (
      <>
        <Col md={6}>
          <FormInput
            label="Livestock Type"
            name="livestock_type"
            type="select"
            register={register}
            errors={errors}
          >
            <option value="">Select Type</option>
            <option value="Cow">Cow</option>
            <option value="Goat">Goat</option>
            <option value="Buffalo">Buffalo</option>
            <option value="Hen">Hen</option>
            <option value="Duck">Duck</option>
            <option value="Pig">Pig</option>
            <option value="Other">Other</option>
          </FormInput>
        </Col>

        <Col md={6}>
          <FormInput
            label="Livestock Count"
            name="livestock_count"
            type="number"
            register={register}
            errors={errors}
          />
        </Col>

        {/* 🌾 Show extra input when 'Other' is selected */}
    {watch("livestock_type") === "Other" && (
      <Col md={6}>
        <FormInput
          label="Add New livestock (വിവരം നൽകുക)"
          name="livestock_type_other"
          register={register}
          errors={errors}
          placeholder="Type here (ഉദാ: റബ്ബർ, വാഴ...)"
        />
      </Col>
    )}
      </>
    )}

    <Col md={6}>
      <YesNoSelect label="Agriculture" name="h_agriculture" />
    </Col>

    {agricultureValue === "true" && (
  <>
    <Col md={6}>
      <FormInput
        label="Agriculture Type"
        name="agriculture_type"
        type="select"
        register={register}
        errors={errors}
      >
        <option value="">Select(തിരഞ്ഞെടുകുക)</option>
        <option value="Paddy Farming">Paddy Farming(നെൽ കൃഷി)</option>
        <option value="Fruits/Vegetable">Fruits/Vegetable(പഴവർഗം/പച്ചകറി)</option>
        <option value="Garden Crop">Garden Crop(തൊട്ടവിള)</option>
        <option value="Coconut">Coconut(നാളികേരം)</option>
        <option value="Diary Farmer">Diary Farmer(ക്ഷീര കർഷകൻ)</option>
        <option value="Fish Farming">Fish Farming(മൽസ്യ കൃഷി)</option>
        <option value="Tapioca">Tapioca(കപ്പ)</option>
        <option value="Other">Other</option>
      </FormInput>
    </Col>

    {/* 🌾 Show extra input when 'Other' is selected */}
    {watch("agriculture_type") === "Other" && (
      <Col md={6}>
        <FormInput
          label="Add New Agriculture (വിവരം നൽകുക)"
          name="agriculture_type_other"
          register={register}
          errors={errors}
          placeholder="Type here (ഉദാ: റബ്ബർ, വാഴ...)"
        />
      </Col>
    )}
  </>
)}

  </Row>
  {/* Navigation Buttons */}
    <div className="d-flex justify-content-between mt-4">
      <Button variant="secondary" onClick={() => setActiveTab("facilities")}>
        ← Previous
      </Button>
      <Button variant="primary" onClick={() => setActiveTab("ration")}>
        Next →
      </Button>
    </div>
</Tab.Pane>


              {/* 🧾 Ration Card */}
              <Tab.Pane eventKey="ration">
  <Row className="gy-3 gx-4">
    <Col md={6}>
      <YesNoSelect label="Ration Card" name="ration_card" />
    </Col>

    {rationCardValue === "true" && (
      <>
        <Col md={6}>
          <FormInput
            label="Ration Card Number"
            name="ration_card_number"
            register={register}
            errors={errors}
          />
        </Col>
        <Col md={6}>
          <FormInput
            label="Ration Card Category"
            name="ration_card_category"
            type="select"
            register={register}
            errors={errors}
          >
            <option value="">Select</option>
            <option value="APL">APL</option>
            <option value="BPL">BPL</option>
          </FormInput>
        </Col>

      </>
    )}

                              <Col md={6}>
                    <FormInput
                      label="Remark"
                      name="remark"
                      register={register}
                      errors={errors}
                      control={control}
                      onChange={(e) => setValue("remark", capitalizeFirstLetter(e.target.value))}
                    />
                  </Col>
  </Row>
  
<div className="d-flex justify-content-between mt-4">
      <Button variant="secondary" onClick={() => setActiveTab("livestock")}>
        ← Previous
      </Button>
      <div>
        <Button variant="light" onClick={onClose} className="me-2">
          Close
        </Button>
        <Button type="submit" variant="success">
          {isEditable ? "Update" : "Submit"}
        </Button>
      </div>
    </div>
  </Tab.Pane>
   {/* ... rest of your tab panes stay SAME ... */}
        </Tab.Content>
        </form>
      </div>
 </Tab.Container>

    {/* ✅ MUST be INSIDE fragment */}
    {showAddMember && (
      <AddEditMember
        isOpen={showAddMember}
        onClose={() => setShowAddMember(false)}
        isEditable={false}
        familyId={selectedFamily}
        onMemberAdded={() => {
          if (selectedFamily) {
            handleFamilyChange({ target: { value: selectedFamily } });
          }
        }}
      />
    )}
  </>
);

}

export default AddHouseForm;

