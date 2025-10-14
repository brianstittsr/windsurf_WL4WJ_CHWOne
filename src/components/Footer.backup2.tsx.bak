import { Container, Row, Col, Button } from "react-bootstrap";
import { person, social } from "@/resources";
import Link from "next/link";

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#f8f9fa', padding: '20px 0', marginTop: 'auto' }}>
      <Container>
        <Row>
          <Col className="text-center">
            <h5>CHWOne Platform</h5>
            <p>Women Leading for Wellness & Justice</p>
            <div>
              {social?.map((item) => (
                item.link && (
                  <Button
                    key={item.name}
                    variant="link"
                    href={item.link}
                    style={{ margin: '0 10px' }}
                  >
                    {item.name}
                  </Button>
                )
              ))}
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}
