import { notFound } from "next/navigation";
import { CustomMDX, ScrollToHash } from "@/components";
import { Container, Box, Typography, Avatar, Divider, Grid } from "@mui/material";
import Link from "next/link";
import Image from "next/image";
import { baseURL, blog, person } from "@/resources";
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
  params: { slug: string | string[] };
}): Promise<Metadata> {
  const slugPath = Array.isArray(params.slug)
    ? params.slug.join("/")
    : params.slug || "";

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

export default function Blog({ params }: { params: { slug: string | string[] } }) {
  const slugPath = Array.isArray(params.slug)
    ? params.slug.join("/")
    : params.slug || "";

  let post = getPosts(["src", "app", "blog", "posts"]).find((post) => post.slug === slugPath);

  if (!post) {
    notFound();
  }

  const avatars =
    post.metadata.team?.map((person) => ({
      src: person.avatar,
    })) || [];

  return (
    <Container maxWidth="lg" sx={{ px: 0 }}>
      <Grid container justifyContent="center">
        <Grid item xs={12} md={10} lg={8} sx={{ py: 4 }}>
          {/* Schema metadata added via head */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Link href="/blog" style={{ fontWeight: 'bold', textDecoration: 'none', display: 'inline-block', marginBottom: 8 }}>
              Blog
            </Link>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {post.metadata.publishedAt && formatDate(post.metadata.publishedAt)}
            </Typography>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 4 }}>{post.metadata.title}</Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4, gap: 2 }}>
            <Avatar sx={{ width: 32, height: 32 }}>
              {person.name.charAt(0)}
            </Avatar>
            <Typography color="primary">{person.name}</Typography>
          </Box>
          
          {post.metadata.image && (
            <Box sx={{ mb: 4 }}>
              <Image
                src={post.metadata.image}
                alt={post.metadata.title}
                width={800}
                height={450}
                style={{ width: '100%', height: 'auto', aspectRatio: '16/9', objectFit: 'cover', borderRadius: 8 }}
              />
            </Box>
          )}
          
          <Box component="article" sx={{ mx: 'auto', maxWidth: '700px' }}>
            <CustomMDX content={post.content} />
          </Box>
          
          <ShareSection 
            title={post.metadata.title} 
            url={`${baseURL}${blog.path}/${post.slug}`} 
          />

          <Box sx={{ mt: 5, pt: 3, textAlign: 'center' }}>
            <Divider sx={{ width: '25%', mx: 'auto', mb: 4 }} />
            <Typography variant="h4" component="h2" sx={{ mb: 4 }}>Recent posts</Typography>
            <Posts exclude={[post.slug]} range={[1, 2]} columns="2" thumbnail direction="column" />
          </Box>
          
          <ScrollToHash />
        </Grid>
        
        <Grid item lg={2} sx={{ display: { xs: 'none', lg: 'block' } }}>
          <Box sx={{ position: 'sticky', top: '80px' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              On this page
            </Typography>
            <Box component="nav">
              <Typography variant="caption" color="text.secondary">Table of contents</Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}
