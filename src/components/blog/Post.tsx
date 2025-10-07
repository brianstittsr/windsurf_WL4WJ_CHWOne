"use client";

import { Card, CardMedia, CardContent, Avatar, Typography, Chip, Box } from "@mui/material";
import Link from "next/link";
import Image from "next/image";
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
        sx={{
          height: '100%',
          border: 'none',
          boxShadow: 1,
          transition: 'transform 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 3
          },
          bgcolor: 'transparent'
        }}
      >
        {post.metadata.image && thumbnail && (
          <CardMedia
            component="img"
            image={post.metadata.image}
            alt={"Thumbnail of " + post.metadata.title}
            sx={{
              aspectRatio: '16/9',
              objectFit: 'cover',
              borderRadius: direction === "row" ? '8px 0 0 8px' : '8px 8px 0 0'
            }}
          />
        )}
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
              <Avatar 
                src={person.avatar} 
                alt={`${person.name} avatar`}
                sx={{ width: 24, height: 24, mr: 1 }}
              />
              <Typography variant="body2">{person.name}</Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
              {formatDate(post.metadata.publishedAt, false)}
            </Typography>
          </Box>
          
          <Typography variant="h6" component="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
            {post.metadata.title}
          </Typography>
          
          {post.metadata.tag && (
            <Chip 
              label={post.metadata.tag}
              size="small"
              sx={{ bgcolor: 'action.hover', color: 'text.secondary' }}
            />
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
