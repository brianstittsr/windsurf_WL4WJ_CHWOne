"use client";

import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";

interface ProjectCardProps {
  href: string;
  priority?: boolean;
  images: string[];
  title: string;
  content: string;
  description: string;
  avatars: { src: string }[];
  link: string;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  title,
  content,
  description,
}) => {
  return (
    <Card sx={{ mb: 4, boxShadow: 2 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>{title}</Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>{content}</Typography>
        <Typography variant="body2" color="text.secondary">{description}</Typography>
      </CardContent>
    </Card>
  );
};
