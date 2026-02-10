import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Modal, Row, Col, Button } from "react-bootstrap";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { FormInput } from "../../../components";

const AddEducationMemberForm = ({
  isOpen,
  onClose,
  isEditable,
  eduMemberData,
  onRemoveEduMember,
  onUpdateEduMember,
  onAddEduMember,
  members,
}) => {
  // ✅ Validation schema
  const schemaResolver = yupResolver(
    yup.object().shape({
      member: yup.string().required("Select a member"),
      age: yup
        .number()
        .typeError("Enter valid age")
        .required("Age is required"),
      gender: yup.string().required("Select gender"),
      is_literate: yup.boolean(),
      is_studying: yup.boolean(),
      current_class: yup.string().when("is_studying", {
        is: true,
        then: (schema) => schema.required("Current class required"),
      }),
      institution_name: yup.string(),
      institution_type: yup.string(),
      highest_qualification: yup.string().required("Select qualification"),

      // job validation
      has_job: yup.boolean().required(),
      job_type: yup.string().when("has_job", {
        is: true,
        then: (schema) => schema.required("Select Job Type"),
      }),
      job_workplace: yup.string().when("has_job", {
        is: true,
        then: (schema) => schema.required("Enter Job Workplace"),
      }),
    })
  );

  const {
    handleSubmit,
    register,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    resolver: schemaResolver,
  });

  const hasJob = watch("has_job");

  // Reset form
  useEffect(() => {
    if (isOpen) {
      if (isEditable && eduMemberData) {
        reset({
          ...eduMemberData,
          member: eduMemberData.member?.id || eduMemberData.member || "",
        });
      } else {
        reset({
          member: "",
          age: "",
          gender: "",
          is_literate: true,
          is_studying: false,
          current_class: "",
          institution_name: "",
          institution_type: "",
          highest_qualification: "",
          vocational_training: "",
          knows_computer: false,
          knows_internet: false,
          knows_smartphone: false,
          is_dropout: false,
          dropout_class: "",
          dropout_reason: "",
          has_job: false,
          job_type: "",
          job_workplace: "",
        });
      }
    }
  }, [isOpen, isEditable, eduMemberData, reset]);

  // Submit
  const onSubmitEduMember = (data) => {
    const formattedData = {
      ...data,
      member: parseInt(data.member, 10),
      year: data.year ? parseInt(data.year, 10) : null,
    };

    console.log("📘 Education Member form submitted:", formattedData);
    isEditable
      ? onUpdateEduMember(formattedData)
      : onAddEduMember(formattedData);
  };

  return (
    <Modal show={isOpen} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {isEditable ? "Edit Member Education" : "Add Member Education"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form noValidate onSubmit={handleSubmit(onSubmitEduMember)}>
          <Row>
            {/* Member Dropdown */}
            <Col md={6}>
              <FormInput
                label="Select Member"
                name="member"
                type="select"
                register={register}
                errors={errors}
              >
                <option value="">-- Select Member --</option>
                {members?.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.m_name} ({m.family_name})
                  </option>
                ))}
              </FormInput>
            </Col>
            <Col md={3}>
              <FormInput
                label="Age"
                name="age"
                type="number"
                register={register}
                errors={errors}
              />
            </Col>
            <Col md={3}>
              <FormInput
                label="Gender"
                name="gender"
                type="select"
                register={register}
                errors={errors}
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </FormInput>
            </Col>

            {/* Literacy */}
            <Col md={6}>
              <label className="form-label">Literate?</label>
              <div>
                <label className="me-3">
                  <input type="radio" value="true" {...register("is_literate")} />
                  Yes
                </label>
                <label>
                  <input
                    type="radio"
                    value="false"
                    {...register("is_literate")}
                  />
                  No
                </label>
              </div>
            </Col>

            {/* Current Education */}
            <Col md={6}>
              <label className="form-label">Currently Studying?</label>
              <div>
                <label className="me-3">
                  <input type="radio" value="true" {...register("is_studying")} />
                  Yes
                </label>
                <label>
                  <input
                    type="radio"
                    value="false"
                    {...register("is_studying")}
                  />
                  No
                </label>
              </div>
            </Col>
            {hasJob && (
              <>
                <Col md={6}>
                  <FormInput
                    label="Current Class / Course"
                    name="current_class"
                    register={register}
                    errors={errors}
                  />
                </Col>
              </>
            )}
            <Col md={6}>
              <FormInput
                label="Institution Name"
                name="institution_name"
                register={register}
                errors={errors}
              />
            </Col>
            <Col md={6}>
              <FormInput
                label="Institution Type"
                name="institution_type"
                type="select"
                register={register}
                errors={errors}
              >
                <option value="">Select</option>
                <option value="govt">Government</option>
                <option value="private">Private</option>
                <option value="aided">Aided</option>
              </FormInput>
            </Col>

            {/* Highest Qualification */}
            <Col md={6}>
              <FormInput
                label="Highest Qualification"
                name="highest_qualification"
                type="select"
                register={register}
                errors={errors}
              >
                <option value="">Select</option>
                <option value="none">No Formal Education</option>
                <option value="sslc">SSLC</option>
                <option value="plus_two">Plus Two</option>
                <option value="iti">ITI</option>
                <option value="diploma">Diploma</option>
                <option value="degree">Degree</option>
                <option value="pg">Post Graduate</option>
                <option value="phd">Ph.D.</option>
              </FormInput>
            </Col>

            {/* Vocational & Digital Literacy */}
            <Col md={6}>
              <FormInput
                label="Vocational Training"
                name="vocational_training"
                register={register}
                errors={errors}
              />
            </Col>
            <Col md={12}>
              <label className="me-3">
                <input type="checkbox" {...register("knows_computer")} /> Knows
                Computer
              </label>
              <label className="me-3">
                <input type="checkbox" {...register("knows_internet")} /> Knows
                Internet
              </label>
              <label>
                <input type="checkbox" {...register("knows_smartphone")} /> Knows
                Smartphone
              </label>
            </Col>

            {/* Dropout Info */}
            <Col md={6}>
              <label className="form-label">Dropout?</label>
              <div>
                <label className="me-3">
                  <input type="radio" value="true" {...register("is_dropout")} />
                  Yes
                </label>
                <label>
                  <input
                    type="radio"
                    value="false"
                    {...register("is_dropout")}
                  />
                  No
                </label>
              </div>
            </Col>
            <Col md={6}>
              <FormInput
                label="Dropout Class"
                name="dropout_class"
                register={register}
                errors={errors}
              />
            </Col>
            <Col md={12}>
              <FormInput
                label="Dropout Reason"
                name="dropout_reason"
                register={register}
                errors={errors}
              />
            </Col>

            {/* Job Info */}
            <Col md={6}>
              <label className="form-label">Currently Working?</label>
              <div>
                <label className="me-3">
                  <input type="radio" value="true" {...register("has_job")} />
                  Yes
                </label>
                <label>
                  <input type="radio" value="false" {...register("has_job")} />
                  No
                </label>
              </div>
            </Col>

            {hasJob === "true" && (
              <>
                <Col md={6}>
                  <FormInput
                    label="Job Type"
                    name="job_type"
                    type="select"
                    register={register}
                    errors={errors}
                  >
                    <option value="">Select</option>
                    <option value="private">Private</option>
                    <option value="govt">Government</option>
                    <option value="abroad">Abroad</option>
                  </FormInput>
                </Col>
                <Col md={12}>
                  <FormInput
                    label="Job Workplace"
                    name="job_workplace"
                    register={register}
                    errors={errors}
                  />
                </Col>
              </>
            )}
          </Row>

          <Row className="mt-3">
            <Col xs={4}>
              {isEditable && (
                <Button variant="danger" onClick={onRemoveEduMember}>
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

export default AddEducationMemberForm;
