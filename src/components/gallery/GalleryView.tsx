"use client";

import { Row, Col, Image } from "react-bootstrap";
import { useState } from "react";
import { gallery } from "@/resources";

export default function GalleryView() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Create two columns for masonry-like layout
  const leftColumnImages = gallery.images.filter((_, i) => i % 2 === 0);
  const rightColumnImages = gallery.images.filter((_, i) => i % 2 === 1);

  return (
    <>
      <Row className="g-3">
        <Col xs={12} md={6}>
          {leftColumnImages.map((image, index) => (
            <div key={index} className="mb-3">
              <Image
                fluid
                className="rounded shadow-sm w-100"
                style={{
                  aspectRatio: image.orientation === "horizontal" ? "16/9" : "3/4",
                  objectFit: "cover",
                  cursor: "pointer"
                }}
                src={image.src}
                alt={image.alt}
                onClick={() => setSelectedImage(image.src)}
                loading={index < 5 ? "eager" : "lazy"}
              />
            </div>
          ))}
        </Col>
        <Col xs={12} md={6}>
          {rightColumnImages.map((image, index) => (
            <div key={index} className="mb-3">
              <Image
                fluid
                className="rounded shadow-sm w-100"
                style={{
                  aspectRatio: image.orientation === "horizontal" ? "16/9" : "3/4",
                  objectFit: "cover",
                  cursor: "pointer"
                }}
                src={image.src}
                alt={image.alt}
                onClick={() => setSelectedImage(image.src)}
                loading={index < 5 ? "eager" : "lazy"}
              />
            </div>
          ))}
        </Col>
      </Row>

      {/* Lightbox modal */}
      {selectedImage && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ 
            backgroundColor: 'rgba(0,0,0,0.8)', 
            zIndex: 1050,
            cursor: 'pointer'
          }}
          onClick={() => setSelectedImage(null)}
        >
          <div className="position-relative" style={{ maxHeight: '90vh', maxWidth: '90vw' }}>
            <button 
              className="position-absolute top-0 end-0 btn btn-dark rounded-circle m-2"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(null);
              }}
            >
              &times;
            </button>
            <Image 
              src={selectedImage} 
              style={{ maxHeight: '90vh', maxWidth: '90vw', objectFit: 'contain' }} 
              alt="Enlarged view" 
            />
          </div>
        </div>
      )}
    </>
  );
}
