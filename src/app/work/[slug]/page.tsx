import { notFound } from "next/navigation";
import { getPosts } from "@/utils/utils";
import { Container, Row, Col, Card, Image } from "react-bootstrap";
import Link from "next/link";
import { baseURL, about, person, work } from "@/resources";
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
      url: `${baseURL}${work.path}/${post.slug}`,
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
    <Container as="section" className="py-5 d-flex flex-column align-items-center" style={{ maxWidth: '900px' }}>
      {/* Schema metadata added via head */}
      <div className="text-center mb-4" style={{ maxWidth: '600px' }}>
        <Link href="/work" className="fw-bold text-decoration-none mb-3 d-inline-block">
          Projects
        </Link>
        <div className="text-muted small mb-3">
          {post.metadata.publishedAt && formatDate(post.metadata.publishedAt)}
        </div>
        <h1 className="display-5 fw-bold mb-4">{post.metadata.title}</h1>
      </div>
      
      <div className="d-flex align-items-center justify-content-center mb-4">
        {post.metadata.team && (
          <div className="d-flex align-items-center gap-3">
            <div className="d-flex">
              {/* Simple avatar display instead of AvatarGroup */}
              {avatars.slice(0, 3).map((avatar, i) => (
                <div key={i} className="rounded-circle overflow-hidden border border-light" 
                  style={{ width: '32px', height: '32px', marginLeft: i > 0 ? '-8px' : '0' }}>
                  <Image src={avatar.src} width={32} height={32} alt="Team member" />
                </div>
              ))}
            </div>
            <div>
              {post.metadata.team?.map((member, idx) => (
                <span key={idx}>
                  {idx > 0 && <span className="text-muted">, </span>}
                  <a href={member.linkedIn} className="text-decoration-none">{member.name}</a>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {post.metadata.images.length > 0 && (
        <div className="mb-5 w-100">
          <Image 
            src={post.metadata.images[0]} 
            alt="Project image" 
            className="rounded w-100" 
            style={{ aspectRatio: '16/9', objectFit: 'cover' }} 
          />
        </div>
      )}
      
      <div className="mx-auto" style={{ maxWidth: '700px' }}>
        <CustomMDX source={post.content} />
      </div>
      
      <div className="w-100 d-flex flex-column align-items-center mt-5">
        <hr className="w-25 my-5" />
        <h2 className="mb-4">Related projects</h2>
        <Projects exclude={[post.slug]} range={[2]} />
      </div>
      
      <ScrollToHash />
    </Container>
  );
}
