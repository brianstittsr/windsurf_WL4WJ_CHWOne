import React from 'react';
import { Container, Row, Col, Card, Image, Badge, Button } from 'react-bootstrap';
import Link from 'next/link';
import { baseURL, about, person, social } from "@/resources";
import TableOfContents from "@/components/about/TableOfContents";
import styles from "@/components/about/about.module.scss";

export async function generateMetadata() {
  return {
    title: about.title,
    description: about.description,
    openGraph: {
      title: about.title,
      description: about.description,
      url: `${baseURL}${about.path}`,
      images: [`${baseURL}/api/og/generate?title=${encodeURIComponent(about.title)}`],
    },
  };
}

export default function About() {
  const structure = [
    {
      title: about.intro.title,
      display: about.intro.display,
      items: [],
    },
    {
      title: about.work.title,
      display: about.work.display,
      items: about.work.experiences.map((experience) => experience.company),
    },
    {
      title: about.studies.title,
      display: about.studies.display,
      items: about.studies.institutions.map((institution) => institution.name),
    },
    {
      title: about.technical.title,
      display: about.technical.display,
      items: about.technical.skills.map((skill) => skill.title),
    },
  ];
  return (
    <Container className="py-5" style={{ maxWidth: '900px' }}>
      <h1 className="mb-2 text-center">About CHWOne</h1>
      <p className="text-muted mb-5 text-center">Learn about our mission to empower Community Health Workers and strengthen healthcare access in underserved communities</p>
      
      {/* Schema metadata added via head */}
        {about.tableOfContent.display && (
          <div className="d-none d-lg-block position-fixed" style={{ left: '20px', top: '50%', transform: 'translateY(-50%)' }}>
            <TableOfContents structure={structure} about={about} />
          </div>
        )}
        
        <Row className="justify-content-center">
          {about.avatar.display && (
            <Col lg={3} className="text-center mb-4 mb-lg-0">
              <div className="position-sticky" style={{ top: '80px' }}>
                <Image 
                  src={person.avatar} 
                  alt={`${person.name} profile picture`}
                  width={160} 
                  height={160} 
                  roundedCircle 
                  className="mb-3" 
                />
                <div className="d-flex align-items-center justify-content-center mb-3">
                  <i className="bi bi-globe me-2"></i>
                  {person.location}
                </div>
                {person.languages && person.languages.length > 0 && (
                  <div className="d-flex flex-wrap justify-content-center gap-2">
                    {person.languages.map((language, index) => (
                      <Badge key={index} bg="light" text="dark" className="py-2 px-3">
                        {language}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </Col>
          )}
          <Col lg={9}>
            <div id={about.intro.title} className="mb-5 text-center">
              {about.calendar.display && (
                <div className="d-inline-flex align-items-center bg-light rounded-pill px-3 py-2 mb-4 border">
                  <i className="bi bi-calendar me-2"></i>
                  <span className="me-2">Schedule a call</span>
                  <a href={about.calendar.link} className="btn btn-sm btn-outline-secondary rounded-circle">
                    <i className="bi bi-chevron-right"></i>
                  </a>
                </div>
              )}
              <h1 className="display-4 fw-bold">{person.name}</h1>
              <p className="text-muted">{person.role}</p>
              
              {social.length > 0 && (
                <div className="d-flex flex-wrap justify-content-center gap-2 mt-4 mb-2">
                  {social.map(
                    (item) =>
                      item.link && (
                        <React.Fragment key={item.name}>
                          <a 
                            href={item.link}
                            className="btn btn-outline-secondary d-none d-md-inline-flex align-items-center"
                          >
                            <i className={`bi bi-${item.icon} me-2`}></i>
                            {item.name}
                          </a>
                          <a 
                            href={item.link}
                            className="btn btn-outline-secondary d-inline-flex d-md-none align-items-center justify-content-center"
                            style={{ width: '40px', height: '40px' }}
                          >
                            <i className={`bi bi-${item.icon}`}></i>
                          </a>
                        </React.Fragment>
                      )
                  )}
                </div>
              )}
            </div>

            {about.intro.display && (
              <div className="mb-5 fs-5">
                {about.intro.description}
              </div>
            )}

            {about.work.display && (
              <>
                <h2 id={about.work.title} className="display-6 fw-bold mb-4">
                  {about.work.title}
                </h2>
                <div className="mb-5">
                  {about.work.experiences.map((experience, index) => (
                    <div key={`${experience.company}-${experience.role}-${index}`} className="mb-5">
                      <div className="d-flex justify-content-between align-items-end mb-2">
                        <h3 id={experience.company} className="h4 fw-bold mb-0">
                          {experience.company}
                        </h3>
                        <span className="text-muted small">
                          {experience.timeframe}
                        </span>
                      </div>
                      <p className="text-primary mb-3">
                        {experience.role}
                      </p>
                      <ul className="ps-4">
                        {experience.achievements.map(
                          (achievement: React.ReactNode, index: number) => (
                            <li
                              key={`${experience.company}-${index}`}
                              className="mb-2"
                            >
                              {achievement}
                            </li>
                          ),
                        )}
                      </ul>
                      {experience.images && experience.images.length > 0 && (
                        <div className="d-flex flex-wrap gap-3 mt-4 ps-4">
                          {experience.images.map((image, index) => (
                            <div
                              key={index}
                              className="border rounded overflow-hidden"
                              style={{ width: image.width, height: image.height }}
                            >
                              <Image
                                fluid
                                alt={image.alt}
                                src={image.src}
                                className="w-100 h-100 object-fit-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {about.studies.display && (
              <>
                <h2 id={about.studies.title} className="display-6 fw-bold mb-4">
                  {about.studies.title}
                </h2>
                <div className="mb-5">
                  {about.studies.institutions.map((institution, index) => (
                    <div key={`${institution.name}-${index}`} className="mb-4">
                      <h3 id={institution.name} className="h4 fw-bold mb-2">
                        {institution.name}
                      </h3>
                      <p className="text-muted">
                        {institution.description}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {about.technical.display && (
              <>
                <h2
                  id={about.technical.title}
                  className="display-6 fw-bold mb-5"
                >
                  {about.technical.title}
                </h2>
                <div>
                  {about.technical.skills.map((skill, index) => (
                    <div key={`${skill}-${index}`} className="mb-5">
                      <h3 id={skill.title} className="h4 fw-bold mb-2">
                        {skill.title}
                      </h3>
                      <p className="text-muted mb-3">
                        {skill.description}
                      </p>
                      {skill.tags && skill.tags.length > 0 && (
                        <div className="d-flex flex-wrap gap-2 mb-3">
                          {skill.tags.map((tag, tagIndex) => (
                            <Badge key={`${skill.title}-${tagIndex}`} bg="light" text="dark" className="py-2 px-3">
                              {tag.icon && <i className={`bi bi-${tag.icon} me-2`}></i>}
                              {tag.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {skill.images && skill.images.length > 0 && (
                        <div className="d-flex flex-wrap gap-3 mt-4">
                          {skill.images.map((image, index) => (
                            <div
                              key={index}
                              className="border rounded overflow-hidden"
                              style={{ width: image.width, height: image.height }}
                            >
                              <Image
                                fluid
                                alt={image.alt}
                                src={image.src}
                                className="w-100 h-100 object-fit-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </Col>
        </Row>
    </Container>
  );
}