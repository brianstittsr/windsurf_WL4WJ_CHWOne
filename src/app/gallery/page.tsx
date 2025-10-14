import { Container } from "@mui/material";
import GalleryView from "@/components/gallery/GalleryView";
import { baseURL, gallery, person } from "@/resources";

export async function generateMetadata() {
  return {
    title: gallery.title,
    description: gallery.description,
    openGraph: {
      title: gallery.title,
      description: gallery.description,
      url: `${baseURL}/gallery`,
      images: [`${baseURL}/api/og/generate?title=${encodeURIComponent(gallery.title)}`],
    },
  };
}

export default function Gallery() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Schema metadata added via head */}
      <GalleryView />
    </Container>
  );
}
