import { Container, Row, Col } from "react-bootstrap";
import { Mailchimp } from "@/components";
import { Posts } from "@/components/blog/Posts";
import { baseURL, blog, person, newsletter } from "@/resources";

export async function generateMetadata() {
  return {
    title: blog.title,
    description: blog.description,
    openGraph: {
      title: blog.title,
      description: blog.description,
      url: `${baseURL}${blog.path}`,
      images: [`${baseURL}/api/og/generate?title=${encodeURIComponent(blog.title)}`],
    },
  };
}

export default function Blog() {
  return (
    <Container className="py-5" style={{ maxWidth: '900px' }}>
      {/* Schema metadata added via head */}
      <h1 className="mb-4 ps-3">{blog.title}</h1>
      
      <div className="d-flex flex-column gap-5">
        <Posts range={[1, 1]} thumbnail />
        <Posts range={[2, 3]} columns="2" thumbnail direction="column" />
        <Mailchimp className="mb-5" />
        <h2 className="mb-4 ps-4">Earlier posts</h2>
        <Posts range={[4]} columns="2" />
      </div>
    </Container>
  );
}
