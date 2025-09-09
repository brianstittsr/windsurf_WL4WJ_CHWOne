import { Container } from "react-bootstrap";
import GalleryView from "@/components/gallery/GalleryView";
import { baseURL, gallery, person } from "@/resources";

export async function generateMetadata() {
  return {
    title: gallery.title,
    description: gallery.description,
    openGraph: {
      title: gallery.title,
      description: gallery.description,
      url: `${baseURL}${gallery.path}`,
      images: [`${baseURL}/api/og/generate?title=${encodeURIComponent(gallery.title)}`],
    },
  };
}

export default function Gallery() {
  return (
    <Container className="py-4" style={{ maxWidth: '1200px' }}>
      {/* Schema metadata added via head */}
      <GalleryView />
    </Container>
  );
}
