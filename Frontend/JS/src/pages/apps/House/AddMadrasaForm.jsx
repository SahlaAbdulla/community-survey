import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Modal, Row, Col, Button } from "react-bootstrap";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { FormInput } from "../../../components";

const AddMadrasaForm = ({
  isOpen,
  onClose,
  isEditable,
  madrasaData,
  onRemoveMadrasa,
  onUpdateMadrasa,
  onAddMadrasa,
  houses,
}) => {
  // ✅ Validation schema
  const schemaResolver = yupResolver(
    yup.object().shape({
      madrasa_name: yup.string().required("Enter madrasa name"),
      location: yup.string().nullable(),
      total_students: yup.number().min(0).required("Enter number of students"),
      male_students: yup.number().min(0).required("Enter number of male students"),
      female_students: yup.number().min(0).required("Enter number of female students"),
      total_teachers: yup.number().min(0).required("Enter number of teachers"),
      teacher_qualification: yup.string().nullable(),
      syllabus_books: yup.string().nullable(),
      class_timings: yup.string().nullable(),
      arabic_special: yup.boolean(),
      has_toilet: yup.boolean(),
      has_water: yup.boolean(),
      building_status: yup.string().required("Select building type"),
      house: yup.string().required("Select a house"),
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

  // Reset form when modal opens
 useEffect(() => {
  if (isOpen) {
    if (isEditable && madrasaData) {
      reset({
        ...madrasaData,
        house: madrasaData.house?.id || madrasaData.house || "",
      });
    } else {
      reset({
        madrasa_name: "",
        location: "",
        total_students: "",
        male_students: "",
        female_students: "",
        total_teachers: "",
        teacher_qualification: "",
        syllabus_books: "",
        class_timings: "",
        arabic_special: false,
        has_toilet: false,
        has_water: false,
        building_status: "",
        house: madrasaData?.house || "",  // 👈 pre-fill if passed
      });
    }
  }
}, [isOpen, isEditable, madrasaData, reset]);


  const onSubmitMadrasa = (data) => {
  const formattedData = {
    ...data,
    house: parseInt(data.house, 10),
    arabic_special: Boolean(data.arabic_special),
    has_toilet: Boolean(data.has_toilet),
    has_water: Boolean(data.has_water),
  };
  isEditable ? onUpdateMadrasa(formattedData) : onAddMadrasa(formattedData);
};


  return (
    <Modal show={isOpen} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{isEditable ? "Edit Madrasa Info" : "Add Madrasa Info"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form noValidate onSubmit={handleSubmit(onSubmitMadrasa)}>
          <Row>
            <Col md={6}>
              <FormInput label="Madrasa Name" name="madrasa_name" type="text" register={register} errors={errors} control={control} />
            </Col>
            <Col md={6}>
              <FormInput label="Location" name="location" type="text" register={register} errors={errors} control={control} />
            </Col>
            <Col md={4}>
              <FormInput label="Total Students" name="total_students" type="number" register={register} errors={errors} control={control} />
            </Col>
            <Col md={4}>
              <FormInput label="Male Students" name="male_students" type="number" register={register} errors={errors} control={control} />
            </Col>
            <Col md={4}>
              <FormInput label="Female Students" name="female_students" type="number" register={register} errors={errors} control={control} />
            </Col>
            <Col md={6}>
              <FormInput label="Total Teachers" name="total_teachers" type="number" register={register} errors={errors} control={control} />
            </Col>
            <Col md={6}>
              <FormInput label="Teacher Qualification" name="teacher_qualification" type="text" register={register} errors={errors} control={control} />
            </Col>
            <Col md={6}>
              <FormInput label="Syllabus / Books" name="syllabus_books" type="text" register={register} errors={errors} control={control} />
            </Col>
            <Col md={6}>
              <FormInput label="Class Timings" name="class_timings" type="text" register={register} errors={errors} control={control} />
            </Col>
            <Col md={6}>
              <FormInput label="Arabic Special?" name="arabic_special" type="checkbox" register={register} errors={errors} control={control} />
            </Col>
            <Col md={6}>
              <FormInput label="Building Status" name="building_status" type="select" register={register} errors={errors} control={control}>
                <option value="">Select</option>
                <option value="own">Own</option>
                <option value="rent">Rent</option>
              </FormInput>
            </Col>
            <Col md={6}>
              <FormInput label="Toilet Available?" name="has_toilet" type="checkbox" register={register} errors={errors} control={control} />
            </Col>
            <Col md={6}>
              <FormInput label="Water Facility?" name="has_water" type="checkbox" register={register} errors={errors} control={control} />
            </Col>

            {/* House select */}
            <Col md={12} className="mt-3">
              <label className="form-label">House</label>
              <select {...register("house")} className="form-select">
                <option value="">Select House</option>
                {houses?.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.owner} ({h.family_name} {h.h_no}{h.sub})
                  </option>
                ))}
              </select>
              {errors.house && <div className="text-danger">{errors.house.message}</div>}
            </Col>
          </Row>

          <Row className="mt-3">
            <Col xs={4}>
              {isEditable && (
                <Button
  variant="danger"
  onClick={() => {
    if (window.confirm("Are you sure you want to delete this Madrasa?")) {
      onRemoveMadrasa();
    }
  }}
>
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

export default AddMadrasaForm;
