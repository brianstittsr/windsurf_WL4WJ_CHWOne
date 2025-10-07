"use client";

import React from "react";
import { Card, Carousel, Row, Col, Image } from "react-bootstrap";
import Link from "next/link";
import { FaArrowRight, FaExternalLinkAlt } from "react-icons/fa";

interface ProjectCardProps {
  href: string;
  priority?: boolean;
  images: string[];
  title: string;
  content: string;
  description: string;
  avatars: { src: string }[];
  link: string;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  href,
  images = [],
  title,
  content,
  description,
  avatars,
  link,
}) => {
  return (
    <Card className="border-0 shadow-sm mb-4">
      {/* Image Carousel */}
      {images.length > 0 && (
        <Carousel>
          {images.map((image, index) => (
            <Carousel.Item key={index}>
              <img
                className="d-block w-100"
                src={image}
                alt={`${title} - slide ${index + 1}`}
                style={{ 
                  objectFit: 'cover',
                  height: '300px'
                }}
              />
            </Carousel.Item>
          ))}
        </Carousel>
      )}
      
      <Card.Body className="p-4">
        {/* Title */}
        {title && (
          <Card.Title as="h2" className="fw-bold mb-3">
            {title}
          </Card.Title>
        )}
        
        {/* Content Section */}
        {(avatars?.length > 0 || description?.trim() || content?.trim()) && (
          <div className="mt-3">
            {/* Avatars */}
            {avatars?.length > 0 && (
              <div className="mb-3 d-flex">
                {avatars.map((avatar, index) => (
                  <Image 
                    key={index}
                    src={avatar.src}
                    width={32}
                    height={32}
                    roundedCircle
                    className="border border-white"
                    style={{ 
                      marginLeft: index > 0 ? '-10px' : '0',
                      zIndex: avatars.length - index
                    }}
                  />
                ))}
              </div>
            )}
            
            {/* Description */}
            {description?.trim() && (
              <Card.Text className="text-muted mb-3">
                {description}
              </Card.Text>
            )}
            
            {/* Links */}
            <div className="d-flex flex-wrap gap-3">
              {content?.trim() && (
                <Link 
                  href={href}
                  className="text-decoration-none d-inline-flex align-items-center"
                >
                  Read case study <FaArrowRight className="ms-2" size={14} />
                </Link>
              )}
              
              {link && (
                <Link 
                  href={link}
                  className="text-decoration-none d-inline-flex align-items-center"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View project <FaExternalLinkAlt className="ms-2" size={14} />
                </Link>
              )}
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};
