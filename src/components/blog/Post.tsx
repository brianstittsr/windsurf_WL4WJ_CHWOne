"use client";

import { Card, Row, Col, Image } from "react-bootstrap";
import Link from "next/link";
import { formatDate } from "@/utils/formatDate";
import { person } from "@/resources";

interface PostProps {
  post: any;
  thumbnail: boolean;
  direction?: "row" | "column";
}

export default function Post({ post, thumbnail, direction }: PostProps) {
  return (
    <Link href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
      <Card 
        className="h-100 border-0 shadow-sm hover-lift" 
        style={{
          transition: 'transform 0.2s ease-in-out',
          backgroundColor: 'transparent'
        }}
      >
        {post.metadata.image && thumbnail && (
          <Card.Img 
            variant="top" 
            src={post.metadata.image}
            alt={"Thumbnail of " + post.metadata.title}
            style={{
              aspectRatio: '16/9',
              objectFit: 'cover',
              borderRadius: direction === "row" ? '0.5rem 0 0 0.5rem' : '0.5rem 0.5rem 0 0'
            }}
          />
        )}
        <Card.Body className="p-4">
          <div className="d-flex align-items-center mb-3">
            <div className="d-flex align-items-center me-3">
              <Image 
                src={person.avatar} 
                width={24} 
                height={24} 
                roundedCircle 
                className="me-2" 
              />
              <span className="small">{person.name}</span>
            </div>
            <small className="text-muted ms-auto">
              {formatDate(post.metadata.publishedAt, false)}
            </small>
          </div>
          
          <h5 className="card-title fw-bold mb-2">{post.metadata.title}</h5>
          
          {post.metadata.tag && (
            <span className="badge bg-light text-secondary">
              {post.metadata.tag}
            </span>
          )}
        </Card.Body>
      </Card>
    </Link>
  );
}
