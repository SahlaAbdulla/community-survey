import classNames from "classnames";
import { Col, Row } from "react-bootstrap";

// dummy data
import { MdiIconType } from "./data";

interface AllIconsProps {
  icons: MdiIconType[];
}

const AllIcons = ({ icons }: AllIconsProps) => {
  return (
    <>
      <Row className="icon-list-demo">
        {(icons || []).map((icon, index) => {
          return (
            <Col key={index} sm={6} md={4} lg={3}>
              <i className={classNames("mdi", "mdi-" + icon.name)}></i>
              <span>mdi-{icon.name}</span>
            </Col>
          );
        })}
      </Row>
    </>
  );
};

export default AllIcons;
