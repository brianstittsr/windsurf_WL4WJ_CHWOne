import { notFound } from "next/navigation";
import { CustomMDX, ScrollToHash } from "@/components";
import { Container, Row, Col, Image } from "react-bootstrap";
import Link from "next/link";
import { baseURL, about, blog, person } from "@/resources";
import { formatDate } from "@/utils/formatDate";
import { getPosts } from "@/utils/utils";
import { Metadata } from "next";
import React from "react";
import { Posts } from "@/components/blog/Posts";
import { ShareSection } from "@/components/blog/ShareSection";

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const posts = getPosts(["src", "app", "blog", "posts"]);
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string | string[] }>;
}): Promise<Metadata> {
  const routeParams = await params;
  const slugPath = Array.isArray(routeParams.slug)
    ? routeParams.slug.join("/")
    : routeParams.slug || "";

  const posts = getPosts(["src", "app", "blog", "posts"]);
  let post = posts.find((post) => post.slug === slugPath);

  if (!post) return {};

  return {
    title: post.metadata.title,
    description: post.metadata.summary,
    openGraph: {
      title: post.metadata.title,
      description: post.metadata.summary,
      url: `${baseURL}${blog.path}/${post.slug}`,
      images: [post.metadata.image || `${baseURL}/api/og/generate?title=${post.metadata.title}`],
    },
  };
}

export default async function Blog({ params }: { params: Promise<{ slug: string | string[] }> }) {
  const routeParams = await params;
  const slugPath = Array.isArray(routeParams.slug)
    ? routeParams.slug.join("/")
    : routeParams.slug || "";

  let post = getPosts(["src", "app", "blog", "posts"]).find((post) => post.slug === slugPath);

  if (!post) {
    notFound();
  }

  const avatars =
    post.metadata.team?.map((person) => ({
      src: person.avatar,
    })) || [];

  return (
    <Container fluid className="px-0">
      <Row className="justify-content-center">
        <Col lg={8} md={10} className="py-4">
          {/* Schema metadata added via head */}
          <div className="text-center mb-4">
            <Link href="/blog" className="fw-bold text-decoration-none d-inline-block mb-2">
              Blog
            </Link>
            <div className="text-muted small mb-3">
              {post.metadata.publishedAt && formatDate(post.metadata.publishedAt)}
            </div>
            <h1 className="display-5 fw-bold mb-4">{post.metadata.title}</h1>
          </div>
          
          <div className="d-flex align-items-center justify-content-center mb-4">
            <div className="d-flex align-items-center gap-2">
              <Image 
                src={person.avatar} 
                width={32} 
                height={32} 
                roundedCircle 
                className="me-2" 
              />
              <span className="text-primary">{person.name}</span>
            </div>
          </div>
          
          {post.metadata.image && (
            <div className="mb-4">
              <Image
                src={post.metadata.image}
                alt={post.metadata.title}
                fluid
                className="rounded border"
                style={{ aspectRatio: '16/9', objectFit: 'cover' }}
              />
            </div>
          )}
          
          <article className="mx-auto" style={{ maxWidth: '700px' }}>
            <CustomMDX source={post.content} />
          </article>
          
          <ShareSection 
            title={post.metadata.title} 
            url={`${baseURL}${blog.path}/${post.slug}`} 
          />

          <div className="mt-5 pt-3 text-center">
            <hr className="w-25 mx-auto mb-4" />
            <h2 className="mb-4">Recent posts</h2>
            <Posts exclude={[post.slug]} range={[1, 2]} columns="2" thumbnail direction="column" />
          </div>
          
          <ScrollToHash />
        </Col>
        
        <Col lg={2} className="d-none d-lg-block">
          <div className="position-sticky" style={{ top: '80px' }}>
            <div className="text-muted mb-3">
              <i className="bi bi-file-text me-2"></i>
              On this page
            </div>
            {/* Replace HeadingNav with a simple nav placeholder */}
            <nav className="nav flex-column">
              {/* This would normally be populated with headings */}
              <div className="text-muted small">Table of contents</div>
            </nav>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
