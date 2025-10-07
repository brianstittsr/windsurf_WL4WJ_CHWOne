import { slugify as transliterate } from "transliteration";
import Link from "next/link";
import { Typography, Box } from "@mui/material";

type CustomLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href?: string;
};

const CustomLink = ({ href, children, ...props }: CustomLinkProps) => {
  if (href?.startsWith('/')) {
    return (
      <Link href={href} {...props}>
        {children}
      </Link>
    );
  }
  if (href?.startsWith('#')) {
    return <a href={href} {...props}>{children}</a>;
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
    </a>
  );
};

const H1 = ({ children }: { children: React.ReactNode }) => (
  <Typography variant="h1" sx={{ mb: 2, mt: 4, fontWeight: 'bold' }}>
    {children}
  </Typography>
);

const H2 = ({ children }: { children: React.ReactNode }) => (
  <Typography variant="h2" sx={{ mb: 2, mt: 3, fontWeight: 'bold' }}>
    {children}
  </Typography>
);

const H3 = ({ children }: { children: React.ReactNode }) => (
  <Typography variant="h3" sx={{ mb: 2, mt: 3, fontWeight: 'bold' }}>
    {children}
  </Typography>
);

const P = ({ children }: { children: React.ReactNode }) => (
  <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
    {children}
  </Typography>
);

const Blockquote = ({ children }: { children: React.ReactNode }) => (
  <Box
    sx={{
      borderLeft: 4,
      borderColor: 'primary.main',
      pl: 2,
      py: 1,
      my: 2,
      bgcolor: 'grey.100',
      fontStyle: 'italic'
    }}
  >
    {children}
  </Box>
);

const Ul = ({ children }: { children: React.ReactNode }) => (
  <Box component="ul" sx={{ pl: 3, mb: 2 }}>
    {children}
  </Box>
);

const Ol = ({ children }: { children: React.ReactNode }) => (
  <Box component="ol" sx={{ pl: 3, mb: 2 }}>
    {children}
  </Box>
);

const Li = ({ children }: { children: React.ReactNode }) => (
  <Box component="li" sx={{ mb: 1 }}>
    {children}
  </Box>
);

export const components = {
  h1: H1,
  h2: H2,
  h3: H3,
  p: P,
  a: CustomLink,
  blockquote: Blockquote,
  ul: Ul,
  ol: Ol,
  li: Li,
};
