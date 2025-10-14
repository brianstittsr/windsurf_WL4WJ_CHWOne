import { notFound } from "next/navigation";
import { getPosts } from "@/utils/utils";
import { Container, Box, Typography, Avatar, Divider, Stack } from "@mui/material";
import Link from "next/link";
import Image from "next/image";
import { baseURL, person, work } from "@/resources";
import { formatDate } from "@/utils/formatDate";
import { ScrollToHash, CustomMDX } from "@/components";
import { Metadata } from "next";
import { Projects } from "@/components/work/Projects";

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const posts = getPosts(["src", "app", "work", "projects"]);
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

  const posts = getPosts(["src", "app", "work", "projects"]);
  let post = posts.find((post) => post.slug === slugPath);

  if (!post) return {};

  return {
    title: post.metadata.title,
    description: post.metadata.summary,
    openGraph: {
      title: post.metadata.title,
      description: post.metadata.summary,
      url: `${baseURL}/work/${post.slug}`,
      images: [post.metadata.image || `${baseURL}/api/og/generate?title=${post.metadata.title}`],
    },
  };
}

export default async function Project({
  params,
}: {
  params: Promise<{ slug: string | string[] }>;
}) {
  const routeParams = await params;
  const slugPath = Array.isArray(routeParams.slug)
    ? routeParams.slug.join("/")
    : routeParams.slug || "";

  let post = getPosts(["src", "app", "work", "projects"]).find((post) => post.slug === slugPath);

  if (!post) {
    notFound();
  }

  const avatars =
    post.metadata.team?.map((person) => ({
      src: person.avatar,
    })) || [];

  return (
    <Container component="section" maxWidth="md" sx={{ py: 5, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Schema metadata added via head */}
      <Box sx={{ textAlign: 'center', mb: 4, maxWidth: '600px' }}>
        <Link href="/work" style={{ fontWeight: 'bold', textDecoration: 'none', marginBottom: 12, display: 'inline-block' }}>
          Projects
        </Link>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {post.metadata.publishedAt && formatDate(post.metadata.publishedAt)}
        </Typography>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 4 }}>{post.metadata.title}</Typography>
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4 }}>
        {post.metadata.team && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Stack direction="row" spacing={-1}>
              {avatars.slice(0, 3).map((avatar, i) => (
                <Avatar key={i} src={avatar.src} sx={{ width: 32, height: 32, border: '2px solid white' }} />
              ))}
            </Stack>
            <Box>
              {post.metadata.team?.map((member, idx) => (
                <span key={idx}>
                  {idx > 0 && <Typography component="span" color="text.secondary">, </Typography>}
                  <a href={member.linkedIn} style={{ textDecoration: 'none' }}>{member.name}</a>
                </span>
              ))}
            </Box>
          </Box>
        )}
      </Box>
      
      {post.metadata.images.length > 0 && (
        <Box sx={{ mb: 5, width: '100%' }}>
          <Image 
            src={post.metadata.images[0]} 
            alt="Project image" 
            width={900}
            height={506}
            style={{ width: '100%', height: 'auto', aspectRatio: '16/9', objectFit: 'cover', borderRadius: 8 }}
          />
        </Box>
      )}
      
      <Box sx={{ mx: 'auto', maxWidth: '700px' }}>
        <CustomMDX content={post.content} />
      </Box>
      
      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 5 }}>
        <Divider sx={{ width: '25%', my: 5 }} />
        <Typography variant="h4" component="h2" sx={{ mb: 4 }}>Related projects</Typography>
        <Projects exclude={[post.slug]} range={[2]} />
      </Box>
      
      <ScrollToHash />
    </Container>
  );
}
