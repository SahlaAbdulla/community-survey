import React, { useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useForm, FormProvider } from "react-hook-form";
import MalayalamSuggestInput from "../../../../components/MalayalamSuggestInput";
import "./ClusterForm.css";

const ClusterForm = ({ isOpen, onClose, isEditable, clusterData, onSave }) => {
  const methods = useForm({
    defaultValues: {
      name_english: clusterData?.name_english || "",
      name_malayalam: clusterData?.name_malayalam || "",
    },
  });

  const { register, setValue, control, handleSubmit, formState: { errors }, reset } = methods;

  useEffect(() => {
  if (clusterData) {
    // 📝 Edit Mode
    reset({
      name_english: clusterData.name_english || "",
      name_malayalam: clusterData.name_malayalam || "",
    });
  } else {
    // 🆕 Add Mode — clear all fields
    reset({
      name_english: "",
      name_malayalam: "",
    });
  }
}, [clusterData, reset]);


  const onSubmit = (data) => onSave(data);

  return (
    <Modal
  show={isOpen}
  onHide={onClose}
  centered
  dialogClassName="custom-modal-width"
>
  <Modal.Header closeButton className="bg-primary text-white">
    <Modal.Title>{isEditable ? "Edit Cluster" : "Add Cluster"}</Modal.Title>
  </Modal.Header>

      <FormProvider {...methods}>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Modal.Body>
            <Form.Group className="mb-3">
  <Form.Label>Cluster Name (English)</Form.Label>
  <Form.Control
    type="text"
    {...register("name_english", { required: "English name is required" })}
    placeholder="Enter cluster name in English"
    onChange={(e) => {
      // Capitalize each word automatically
      const value = e.target.value;
      const formatted = value
        .split(" ")
        .map(
          (word) =>
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(" ");
      setValue("name_english", formatted);
    }}
  />
  {errors.name_english && (
    <div className="text-danger">{errors.name_english.message}</div>
  )}
</Form.Group>


            <Form.Group>
              <Form.Label>Cluster Name (Malayalam)</Form.Label>
              <MalayalamSuggestInput
                name="name_malayalam"
                label=""
                placeholder="Enter cluster name in Malayalam"
                register={register}
                setValue={setValue}
                control={control}
                errors={errors}
              />
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {isEditable ? "Update" : "Save"}
            </Button>
          </Modal.Footer>
        </Form>
      </FormProvider>
    </Modal>
  );
};

export default ClusterForm;
