import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Modal, Row, Col, Button } from "react-bootstrap";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { FormInput } from "../../../components";

const AddEducationForm = ({
  isOpen,
  onClose,
  isEditable,
  educationData,
  onRemoveEducation,
  onUpdateEducation,
  onAddEducation,
  houses,
}) => {
  // ✅ Validation schema
  const schemaResolver = yupResolver(
    yup.object().shape({
      no_of_students: yup.number().typeError("Enter number").required(),
      n_male: yup.number().typeError("Enter number").required(),
      n_female: yup.number().typeError("Enter number").required(),
      highest_education_level: yup.string().required(),
      
      house: yup.string().required("Select a house"),
      // 🔹 New fields
      tenth_pass: yup.number().typeError("Enter number").default(0),
      plus_one_pass: yup.number().typeError("Enter number").default(0),
      plus_two_pass: yup.number().typeError("Enter number").default(0),
      diploma_pass: yup.number().typeError("Enter number").default(0),
      degree_pass: yup.number().typeError("Enter number").default(0),
      pg_pass: yup.number().typeError("Enter number").default(0),
      professional_pass: yup.number().typeError("Enter number").default(0),
      govt_exam_pass: yup.number().typeError("Enter number").default(0),
      dropouts: yup.number().typeError("Enter number").default(0),
      illiterate: yup.number().typeError("Enter number").default(0),
      special_needs: yup.number().typeError("Enter number").default(0),
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
      if (isEditable && educationData) {
        reset({
          ...educationData,
          house: educationData.house?.id || educationData.house || "",
        });
      } else {
        reset({
          no_of_students: "",
          n_male: "",
          n_female: "",
          highest_education_level: "",
         
          house: "",
          // defaults
          tenth_pass: 0,
          plus_one_pass: 0,
          plus_two_pass: 0,
          diploma_pass: 0,
          degree_pass: 0,
          pg_pass: 0,
          professional_pass: 0,
          govt_exam_pass: 0,
          dropouts: 0,
          illiterate: 0,
          special_needs: 0,
        });
      }
    }
  }, [isOpen, isEditable, educationData, reset]);

  const onSubmitEducation = (data) => {
    const formattedData = {
      ...Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, isNaN(v) ? v : parseInt(v, 10)])
      ),
      house: parseInt(data.house, 10),
    };

    console.log("📘 Education form submitted:", formattedData);
    isEditable ? onUpdateEducation(formattedData) : onAddEducation(formattedData);
  };

  return (
    <Modal show={isOpen} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{isEditable ? "Edit Education Info" : "Add Education Info"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form noValidate onSubmit={handleSubmit(onSubmitEducation)}>
          <Row>
            {/* Basic */}
            <Col md={6}>
              <FormInput label="No. of Students" name="no_of_students" type="number" register={register} errors={errors} control={control} />
            </Col>
            <Col md={6}>
              <FormInput label="No. of Male Students" name="n_male" type="number" register={register} errors={errors} control={control} />
            </Col>
            <Col md={6}>
              <FormInput label="No. of Female Students" name="n_female" type="number" register={register} errors={errors} control={control} />
            </Col>
            <Col md={6}>
              <FormInput label="Highest Education Level" name="highest_education_level" type="select" register={register} errors={errors} control={control}>
                <option value="">Select</option>
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="higher_secondary">Higher Secondary</option>
                <option value="graduate">Graduate</option>
                <option value="post_graduate">Post Graduate</option>
              </FormInput>
            </Col>
            
            <Col md={6}>
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

            {/* 🔹 New milestone fields */}
            <h5 className="mt-4">Academic Milestones</h5>
            {[
              "tenth_pass",
              "plus_one_pass",
              "plus_two_pass",
              "diploma_pass",
              "degree_pass",
              "pg_pass",
              "professional_pass",
              "govt_exam_pass",
              "dropouts",
              "illiterate",
              "special_needs",
            ].map((field) => (
              <Col md={4} key={field}>
                <FormInput
                  label={field.replace(/_/g, " ").toUpperCase()}
                  name={field}
                  type="number"
                  register={register}
                  errors={errors}
                  control={control}
                />
              </Col>
            ))}
          </Row>

          <Row className="mt-3">
            <Col xs={4}>
              {isEditable && (
                <Button variant="danger" onClick={onRemoveEducation}>
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

export default AddEducationForm;
