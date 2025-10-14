import { Container, Row, Col, Button } from "react-bootstrap";
import { person, social } from "@/resources";
import styles from "./Footer.module.scss";
import Link from "next/link";
import { FaGithub, FaTwitter, FaLinkedin } from "react-icons/fa";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  // Map for social icons
  const getSocialIcon = (iconName: string) => {
    switch (iconName) {
      case "github":
        return <FaGithub />;
      case "twitter":
        return <FaTwitter />;
      case "linkedin":
        return <FaLinkedin />;
      default:
        return null;
    }
  };

  return (
    <footer className="py-4 text-center">
      <Container>
        <Row className={`${styles.mobile} justify-content-between align-items-center py-3`}>
          <Col xs={12} md={6} className="text-md-start mb-3 mb-md-0">
            <small className="text-muted">
              © {currentYear} / <span className="text-dark">{person.name}</span>{" "}
              <span className="text-muted">
                {/* Usage of this template requires attribution. Please don't remove the link to Once UI unless you have a Pro license. */}
                / Build your portfolio with{" "}
                <Link href="https://once-ui.com/products/magic-portfolio" className="text-decoration-none">
                  Once UI
                </Link>
              </span>
            </small>
          </Col>
          <Col xs={12} md={6} className="d-flex justify-content-center justify-content-md-end">
            <div className="d-flex gap-3">
              {social.map(
                (item) =>
                  item.link && (
                    <Button
                      key={item.name}
                      href={item.link}
                      variant="link"
                      className="p-1"
                      title={item.name}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {getSocialIcon(item.icon)}
                    </Button>
                  )
              )}
            </div>
          </Col>
        </Row>
        <div className="d-none d-sm-block" style={{ height: "80px" }}></div>
      </Container>
    </footer>
  );
};
