import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Modal, Row, Col, Button, Card } from "react-bootstrap";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { FormInput } from "@/components";
import MalayalamSuggestInput from "../../../../components/MalayalamSuggestInput";

const capitalizeFirst = (value) => {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const FamilyForm = ({ isOpen, onClose, isEditable, familyData, onSave }) => {
  const schemaResolver = yupResolver(
  yup.object().shape({
    family_name_en: yup.string(),   // not required
    family_name_ml: yup.string(),   // not required
    h_no: yup.string(),             // not required
    sub: yup.string(), // only max length rule
  })
);


  const {
    handleSubmit,
    register,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: schemaResolver,
    defaultValues: {
      family_name_en: "",
      family_name_ml: "",
      h_no: "",
      sub: "",
    },
  });

  useEffect(() => {
  if (isOpen) {
    if (familyData) {
      reset(familyData);
    } else {
      reset({
        family_name_en: "",
        family_name_ml: "",
        h_no: "",
        sub: "",
      });
    }
  }
}, [isOpen, familyData, reset]);


  const onSubmitFamily = (data) => {
    onSave({
      ...data,
      family_name_en: capitalizeFirst(data.family_name_en),
      h_no: capitalizeFirst(data.h_no),
      sub: data.sub.toUpperCase(),
    });
  };

  return (
    <Modal show={isOpen} onHide={onClose} centered size="md">
      <Modal.Header closeButton>
        <Modal.Title>{isEditable ? "Edit Family" : "Add Family"}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="px-2 py-2">
        <Card className="shadow-sm border-0 p-4">
          <form noValidate onSubmit={handleSubmit(onSubmitFamily)}>
            <Row className="gy-1"> {/* uniform gap between fields */}
              <Col md={12}>
                <FormInput
                  label="Family Name (English)"
                  name="family_name_en"
                  type="text"
                  register={register}
                  errors={errors}
                  control={control}
                  onChange={(e) =>
                    setValue("family_name_en", capitalizeFirst(e.target.value))
                  }
                />
              </Col>

              <Col md={12}>
                <MalayalamSuggestInput
                  label="Family Name (Malayalam)"
                  name="family_name_ml"
                  register={register}
                  setValue={setValue}
                  errors={errors}
                  control={control}
                />
              </Col>

              <Col md={12}>
                <FormInput
                  label="House Number"
                  name="h_no"
                  type="text"
                  register={register}
                  errors={errors}
                  control={control}
                  onChange={(e) =>
                    setValue("h_no", capitalizeFirst(e.target.value))
                  }
                />
              </Col>

              <Col md={12}>
                <FormInput
                  label="Sub"
                  name="sub"
                  type="text"
                  register={register}
                  errors={errors}
                  control={control}
                  onChange={(e) =>
                    setValue("sub", e.target.value.toUpperCase())
                  }
                />
              </Col>
            </Row>

            {/* Buttons */}
            <div className="mt-4 d-flex justify-content-end gap-2">
              <Button variant="light" onClick={onClose}>
                Close
              </Button>
              <Button type="submit" variant="success">
                Save
              </Button>
            </div>
          </form>
        </Card>
      </Modal.Body>
    </Modal>
  );
};

export default FamilyForm;
