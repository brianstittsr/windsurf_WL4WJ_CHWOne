import { Container, Typography } from "@mui/material";
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
    <Container maxWidth="md" sx={{ py: 5 }}>
      {/* Schema metadata added via head */}
      <Typography variant="h3" component="h1" sx={{ mb: 5, textAlign: 'center' }}>{work.title}</Typography>
      <Projects />
    </Container>
  );
}
