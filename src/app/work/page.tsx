import { Container } from "react-bootstrap";
import { baseURL, about, person, work } from "@/resources";
import { Projects } from "@/components/work/Projects";

export async function generateMetadata() {
  return {
    title: work.title,
    description: work.description,
    openGraph: {
      title: work.title,
      description: work.description,
      url: `${baseURL}${work.path}`,
      images: [`${baseURL}/api/og/generate?title=${encodeURIComponent(work.title)}`],
    },
  };
}

export default function Work() {
  return (
    <Container className="py-5" style={{ maxWidth: '900px' }}>
      {/* Schema metadata added via head */}
      <h1 className="mb-5 text-center">{work.title}</h1>
      <Projects />
    </Container>
  );
}
