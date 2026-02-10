import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Modal, Row, Col, Button } from "react-bootstrap";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { FormInput } from "../../../components";

const AddMadrasaMemberForm = ({
  isOpen,
  onClose,
  isEditable,
  memberData,
  onRemoveMember,
  onUpdateMember,
  onAddMember,
  madrasaHouses,
}) => {
  // ✅ Validation schema
  const schemaResolver = yupResolver(
    yup.object().shape({
      name: yup.string().required("Enter name"),
      age: yup.number().typeError("Enter valid age").required(),
      gender: yup.string().required("Select gender"),
      phone_no: yup.string().nullable(),
      madrasa_name: yup.string().required("Enter madrasa name"),
      languages_studied: yup.string().required("Enter languages (comma separated)"),
      is_studying: yup.boolean(),
      current_class: yup.string().when("is_studying", {
  is: true,
  then: (schema) => schema.required("Enter current class"),
  otherwise: (schema) => schema.nullable(),
}),
last_studied_class: yup.string().when("is_studying", {
  is: false,
  then: (schema) => schema.required("Enter last studied class"),
  otherwise: (schema) => schema.nullable(),
}),
subject_taught: yup.string().when("is_teacher", {
  is: true,
  then: (schema) => schema.required("Enter subject taught"),
  otherwise: (schema) => schema.nullable(),
}),

      house: yup.string().required("Select a madrasa house"),
    })
  );

  const {
    handleSubmit,
    register,
    control,
    formState: { errors },
    reset,
  } = useForm({
    resolver: schemaResolver,
  });

  // Reset form
  useEffect(() => {
    if (isOpen) {
      if (isEditable && memberData) {
        reset({
          ...memberData,
          house: memberData.house?.id || memberData.house || "",
        });
      } else {
        reset({
          name: "",
          age: "",
          gender: "",
          phone_no: "",
          madrasa_name: "",
          languages_studied: "",
          is_studying: true,
          current_class: "",
          last_studied_class: "",
          is_teacher: false,
          subject_taught: "",
          house: "",
        });
      }
    }
  }, [isOpen, isEditable, memberData, reset]);

  // Submit handler
  const onSubmitMember = (data) => {
    const formattedData = {
      ...Object.fromEntries(
        Object.entries(data).map(([k, v]) =>
          ["is_studying", "is_teacher"].includes(k)
            ? (v === true || v === "true")
            : isNaN(v) || v === "" ? v : parseInt(v, 10)
        )
      ),
      house: parseInt(data.house, 10),
    };

    console.log("📘 MadrasaMember form submitted:", formattedData);
    isEditable ? onUpdateMember(formattedData) : onAddMember(formattedData);
  };

  return (
    <Modal show={isOpen} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{isEditable ? "Edit Madrasa Member" : "Add Madrasa Member"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form noValidate onSubmit={handleSubmit(onSubmitMember)}>
          <Row>
            {/* Basic Info */}
            <h5 className="mt-2">Basic Information</h5>
            <Col md={6}>
              <FormInput label="Name" name="name" type="text" register={register} errors={errors} control={control} />
            </Col>
            <Col md={3}>
              <FormInput label="Age" name="age" type="number" register={register} errors={errors} control={control} />
            </Col>
            <Col md={3}>
              <FormInput label="Gender" name="gender" type="select" register={register} errors={errors} control={control}>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </FormInput>
            </Col>
            <Col md={6}>
              <FormInput label="Phone No" name="phone_no" type="text" register={register} errors={errors} control={control} />
            </Col>

            {/* Madrasa Details */}
            <h5 className="mt-3">Madrasa Details</h5>
            <Col md={6}>
              <FormInput label="Madrasa Name" name="madrasa_name" type="text" register={register} errors={errors} control={control} />
            </Col>
            <Col md={6}>
              <FormInput label="Languages Studied" name="languages_studied" type="text" register={register} errors={errors} control={control} />
            </Col>
            <Col md={6}>
              <FormInput label="Currently Studying?" name="is_studying" type="checkbox" register={register} errors={errors} control={control} />
            </Col>
            <Col md={6}>
              <FormInput label="Current Class" name="current_class" type="text" register={register} errors={errors} control={control} />
            </Col>
            <Col md={6}>
              <FormInput label="Last Studied Class" name="last_studied_class" type="text" register={register} errors={errors} control={control} />
            </Col>

            {/* Teacher Info */}
            <h5 className="mt-3">Teacher Information</h5>
            <Col md={6}>
              <FormInput label="Is Teacher?" name="is_teacher" type="checkbox" register={register} errors={errors} control={control} />
            </Col>
            <Col md={6}>
              <FormInput label="Subject Taught" name="subject_taught" type="text" register={register} errors={errors} control={control} />
            </Col>

            {/* House */}
            <h5 className="mt-3">Assign to House</h5>
            <Col md={12}>
              <label className="form-label">Madrasa House</label>
              <select {...register("house")} className="form-select">
                <option value="">Select Madrasa House</option>
                {madrasaHouses?.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.madrasa_name} ({h.location})
                  </option>
                ))}
              </select>
              {errors.house && <div className="text-danger">{errors.house.message}</div>}
            </Col>
          </Row>

          {/* Actions */}
          <Row className="mt-3">
            <Col xs={4}>
              {isEditable && (
                <Button variant="danger" onClick={onRemoveMember}>
                  Delete
                </Button>
              )}
            </Col>
            <Col xs={8} className="text-end">
              <Button className="btn btn-light me-1" onClick={onClose}>
                Close
              </Button>
              <Button type="submit" variant="success">
                Save
              </Button>
            </Col>
          </Row>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default AddMadrasaMemberForm;
