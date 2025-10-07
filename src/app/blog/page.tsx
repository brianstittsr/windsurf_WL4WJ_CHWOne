import { Container, Box, Typography } from "@mui/material";
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
    <Container maxWidth="md" sx={{ py: 5 }}>
      {/* Schema metadata added via head */}
      <Typography variant="h3" component="h1" sx={{ mb: 4, pl: 1 }}>{blog.title}</Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        <Posts range={[1, 1]} thumbnail />
        <Posts range={[2, 3]} columns="2" thumbnail direction="column" />
        <Mailchimp />
        <Typography variant="h4" component="h2" sx={{ mb: 4, pl: 2 }}>Earlier posts</Typography>
        <Posts range={[4]} columns="2" />
      </Box>
    </Container>
  );
}
