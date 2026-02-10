import React from "react";
import { useForm } from "react-hook-form";
import { Button, Row, Col } from "react-bootstrap";

const EducationForm = ({ onAdd }) => {
  const { register, handleSubmit, reset } = useForm();

  const submitEdu = (data) => {
    onAdd(data);
    reset(); // clear form after add
  };

  return (
    <form onSubmit={handleSubmit(submitEdu)} className="border rounded p-3 mb-3">
      <Row>
        <Col md={4}>
          <label className="form-label">Education</label>
          <select {...register("education")} className="form-select">
            <option value="">Select</option>
            <option value="10th">10th</option>
            <option value="+1">+1</option>
            <option value="+2">+2</option>
            <option value="UG">UG</option>
            <option value="PG">PG</option>
          </select>
        </Col>
        <Col md={4}>
          <label className="form-label">Stream</label>
          <input {...register("stream")} className="form-control" placeholder="Science, Commerce" />
        </Col>
        <Col md={4}>
          <label className="form-label">Status</label>
          <select {...register("status")} className="form-select">
            <option value="studying">Studying</option>
            <option value="passed">Passed</option>
            <option value="failed">Failed</option>
          </select>
        </Col>
      </Row>
      <Row className="mt-2">
        <Col md={6}>
          <input {...register("year_completed")} className="form-control" placeholder="Year Completed" />
        </Col>
        <Col md={6}>
          <input {...register("board_university")} className="form-control" placeholder="Board/University" />
        </Col>
      </Row>
      <div className="mt-2 text-end">
        <Button type="submit" size="sm" variant="success">
          + Add Education
        </Button>
      </div>
    </form>
  );
};

export default EducationForm;
