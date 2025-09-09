"use client";

import { Row, Col, Button, Toast, ToastContainer } from "react-bootstrap";
import { useState } from "react";
import { socialSharing } from "@/resources";
import { FaTwitter, FaLinkedin, FaFacebook, FaPinterest, FaWhatsapp, FaReddit, FaTelegram, FaEnvelope, FaLink } from 'react-icons/fa';

interface ShareSectionProps {
  title: string;
  url: string;
}

interface SocialPlatform {
  name: string;
  icon: React.ReactNode;
  label: string;
  generateUrl: (title: string, url: string) => string;
}

const socialPlatforms: Record<string, SocialPlatform> = {
  x: {
    name: "x",
    icon: <FaTwitter />,
    label: "X",
    generateUrl: (title, url) => 
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
  },
  linkedin: {
    name: "linkedin",
    icon: <FaLinkedin />,
    label: "LinkedIn",
    generateUrl: (title, url) => 
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  facebook: {
    name: "facebook",
    icon: <FaFacebook />,
    label: "Facebook",
    generateUrl: (title, url) => 
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  pinterest: {
    name: "pinterest",
    icon: <FaPinterest />,
    label: "Pinterest",
    generateUrl: (title, url) => 
      `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(title)}`,
  },
  whatsapp: {
    name: "whatsapp",
    icon: <FaWhatsapp />,
    label: "WhatsApp",
    generateUrl: (title, url) => 
      `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
  },
  reddit: {
    name: "reddit",
    icon: <FaReddit />,
    label: "Reddit",
    generateUrl: (title, url) => 
      `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
  },
  telegram: {
    name: "telegram",
    icon: <FaTelegram />,
    label: "Telegram",
    generateUrl: (title, url) => 
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  email: {
    name: "email",
    icon: <FaEnvelope />,
    label: "Email",
    generateUrl: (title, url) => 
      `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Check out this post: ${url}`)}`,
  },
};

export function ShareSection({ title, url }: ShareSectionProps) {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');
  
  // Don't render if sharing is disabled
  if (!socialSharing.display) {
    return null;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setToastMessage("Link copied to clipboard");
      setToastVariant("success");
      setShowToast(true);
    } catch (err) {
      console.error('Failed to copy: ', err);
      setToastMessage("Failed to copy link");
      setToastVariant("danger");
      setShowToast(true);
    }
  };

  // Get enabled platforms
  const enabledPlatforms = Object.entries(socialSharing.platforms)
    .filter(([key, enabled]) => enabled && key !== 'copyLink')
    .map(([platformKey]) => ({ key: platformKey, ...socialPlatforms[platformKey] }))
    .filter(platform => platform.name); // Filter out platforms that don't exist in our definitions

  return (
    <div className="my-4">
      <Row className="justify-content-center align-items-center mb-3">
        <Col xs="auto">
          <span className="text-muted">Share this post:</span>
        </Col>
        <Col xs="auto">
          <div className="d-flex gap-2 flex-wrap">
            {enabledPlatforms.map((platform, index) => (
              <Button 
                key={index} 
                variant="outline-secondary" 
                size="sm" 
                href={platform.generateUrl(title, url)}
                target="_blank"
                rel="noopener noreferrer"
                className="d-flex align-items-center"
              >
                <span className="me-1">{platform.icon}</span>
                <span className="d-none d-md-inline">{platform.label}</span>
              </Button>
            ))}
            
            {socialSharing.platforms.copyLink && (
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={handleCopy}
                className="d-flex align-items-center"
              >
                <FaLink className="me-1" />
                <span className="d-none d-md-inline">Copy Link</span>
              </Button>
            )}
          </div>
        </Col>
      </Row>
      
      <ToastContainer position="top-end" className="p-3">
        <Toast 
          onClose={() => setShowToast(false)} 
          show={showToast} 
          delay={3000} 
          autohide 
          bg={toastVariant}
        >
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
}
