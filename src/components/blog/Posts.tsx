import { getPosts } from "@/utils/utils";
import { Grid } from "@mui/material";
import Post from "./Post";

interface PostsProps {
  range?: [number] | [number, number];
  columns?: "1" | "2" | "3";
  thumbnail?: boolean;
  direction?: "row" | "column";
  exclude?: string[];
}

export function Posts({
  range,
  columns = "1",
  thumbnail = false,
  exclude = [],
  direction,
}: PostsProps) {
  let allBlogs = getPosts(["src", "app", "blog", "posts"]);

  // Exclude by slug (exact match)
  if (exclude.length) {
    allBlogs = allBlogs.filter((post) => !exclude.includes(post.slug));
  }

  const sortedBlogs = allBlogs.sort((a, b) => {
    return new Date(b.metadata.publishedAt).getTime() - new Date(a.metadata.publishedAt).getTime();
  });

  const displayedBlogs = range
    ? sortedBlogs.slice(range[0] - 1, range.length === 2 ? range[1] : sortedBlogs.length)
    : sortedBlogs;

  // Convert columns string to number for MUI grid
  const getColumnWidth = (cols: string) => {
    switch (cols) {
      case "1": return 12;
      case "2": return 6;
      case "3": return 4;
      default: return 12;
    }
  };

  const colWidth = getColumnWidth(columns);

  return (
    <>
      {displayedBlogs.length > 0 && (
        <Grid container spacing={4} sx={{ mb: 5 }}>
          {displayedBlogs.map((post) => (
            <Grid item key={post.slug} xs={12} md={colWidth}>
              <Post post={post} thumbnail={thumbnail} direction={direction} />
            </Grid>
          ))}
        </Grid>
      )}
    </>
  );
}
