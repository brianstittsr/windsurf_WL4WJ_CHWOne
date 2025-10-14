import { MDXRemote, MDXRemoteProps } from "next-mdx-remote/rsc";
import React, { ReactNode } from "react";
import { slugify as transliterate } from "transliteration";
import Link from "next/link";
import Image from "next/image";
import { Card, Table, Button, Row, Col, Accordion } from "react-bootstrap";
import { FaLink } from "react-icons/fa";

type CustomLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: ReactNode;
};

function CustomLink({ href, children, ...props }: CustomLinkProps) {
  if (href.startsWith("/")) {
    return (
      <Link href={href} {...props}>
        {children}
      </Link>
    );
  }

  if (href.startsWith("#")) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
    </a>
  );
}

function CustomImage({ alt, src, ...props }: React.ImgHTMLAttributes<HTMLImageElement> & { src: string }) {
  if (!src) {
    console.error("Image requires a valid 'src' property.");
    return null;
  }

  return (
    <div className="my-3">
      <Image
        className="rounded border"
        alt={alt || ""}
        src={src}
        width={960}
        height={540}
        style={{ maxWidth: '100%', height: 'auto' }}
        {...props}
      />
    </div>
  );
}

function slugify(str: string): string {
  const strWithAnd = str.replace(/&/g, " and "); // Replace & with 'and'
  return transliterate(strWithAnd, {
    lowercase: true,
    separator: "-", // Replace spaces with -
  }).replace(/\-\-+/g, "-"); // Replace multiple - with single -
}

function createHeading(as: "h1" | "h2" | "h3" | "h4" | "h5" | "h6") {
  const CustomHeading = ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLHeadingElement>) => {
    const slug = slugify(children as string);
    const HeadingTag = as;
    
    return (
      <div className="position-relative mt-4 mb-3 pt-2" id={slug}>
        <HeadingTag {...props} className={`${props.className || ''}`}>
          {children}
          <a href={`#${slug}`} className="ms-2 text-decoration-none opacity-50 align-middle" style={{ fontSize: '0.7em' }}>
            <FaLink />
          </a>
        </HeadingTag>
      </div>
    );
  };

  CustomHeading.displayName = `${as}`;
  return CustomHeading;
}

function CustomParagraph({ children }: { children: ReactNode }) {
  return (
    <p className="my-3 text-secondary" style={{ lineHeight: "1.75" }}>
      {children}
    </p>
  );
}

function CustomInlineCode({ children }: { children: ReactNode }) {
  return (
    <code className="px-1 py-0.5 bg-light rounded border">
      {children}
    </code>
  );
}

function CustomCodeBlock(props: any) {
  // For pre tags that contain code blocks
  if (props.children && props.children.props && props.children.props.className) {
    const { className, children } = props.children.props;

    // Extract language from className (format: language-xxx)
    const language = className.replace("language-", "");
    const label = language.charAt(0).toUpperCase() + language.slice(1);

    return (
      <div className="my-3 position-relative">
        <div className="bg-dark text-white p-1 ps-3 rounded-top small">
          {label}
          <Button 
            variant="dark" 
            size="sm" 
            className="position-absolute end-0 top-0 m-1"
            onClick={() => navigator.clipboard.writeText(children)}
          >
            Copy
          </Button>
        </div>
        <pre className="bg-dark text-light p-3 rounded-bottom mb-0 overflow-auto">
          <code className={className}>{children}</code>
        </pre>
      </div>
    );
  }

  // Fallback for other pre tags or empty code blocks
  return <pre {...props} className="bg-light p-3 rounded" />;
}

function CustomList({ children, ordered = false }: { children: ReactNode, ordered?: boolean }) {
  const ListTag = ordered ? 'ol' : 'ul';
  return (
    <ListTag className="ps-4 my-3">
      {children}
    </ListTag>
  );
}

function CustomListItem({ children }: { children: ReactNode }) {
  return (
    <li className="my-2" style={{ lineHeight: "1.75" }}>
      {children}
    </li>
  );
}

function CustomHR() {
  return (
    <hr className="my-4 mx-auto w-75" />
  );
}

// Custom Bootstrap components
function CustomAccordion({ title, children }: { title: string, children: ReactNode }) {
  return (
    <Accordion className="my-3">
      <Accordion.Item eventKey="0">
        <Accordion.Header>{title}</Accordion.Header>
        <Accordion.Body>{children}</Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );
}

function CustomCard({ title, children }: { title?: string, children: ReactNode }) {
  return (
    <Card className="my-3">
      {title && <Card.Header>{title}</Card.Header>}
      <Card.Body>{children}</Card.Body>
    </Card>
  );
}

const components = {
  p: CustomParagraph as any,
  h1: createHeading("h1") as any,
  h2: createHeading("h2") as any,
  h3: createHeading("h3") as any,
  h4: createHeading("h4") as any,
  h5: createHeading("h5") as any,
  h6: createHeading("h6") as any,
  img: CustomImage as any,
  a: CustomLink as any,
  code: CustomInlineCode as any,
  pre: CustomCodeBlock as any,
  ol: (props: any) => CustomList({ ...props, ordered: true }),
  ul: CustomList as any,
  li: CustomListItem as any,
  hr: CustomHR as any,
  // Bootstrap components
  Accordion: CustomAccordion,
  Card: CustomCard,
  Table: (props: any) => <Table {...props} className="my-3 table-striped" />,
  Row: (props: any) => <Row {...props} className={`my-3 ${props.className || ''}`} />,
  Col: Col,
  Button: (props: any) => <Button {...props} className={`${props.className || ''}`} />,
};

type CustomMDXProps = MDXRemoteProps & {
  components?: typeof components;
};

export function CustomMDX(props: CustomMDXProps) {
  return <MDXRemote {...props} components={{ ...components, ...(props.components || {}) }} />;
}
