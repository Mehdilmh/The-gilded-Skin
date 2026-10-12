import Link from "next/link";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { isAmazonUrl } from "@/lib/affiliate";
import { Callout, Checklist, ComparisonTable } from "./Blocks";
import { ProsCons, SuitsSkip } from "./ProsCons";
import { ProductCard, ProductComparison } from "@/components/affiliate/ProductCard";
import { EditorialImage } from "@/components/ui/EditorialImage";
import { ShopOnAmazon } from "@/components/affiliate/ShopOnAmazon";

function SmartLink({ href = "", children, ...rest }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  if (href.startsWith("/") || href.startsWith("#")) {
    return (
      <Link href={href} {...rest}>
        {children}
      </Link>
    );
  }
  if (isAmazonUrl(href)) {
    // Raw retailer links bypass product records and disclosures; the content
    // audit fails on them. Render as plain text so nothing slips through.
    return <span data-blocked-link={href}>{children}</span>;
  }
  return (
    <a href={href} rel="noopener" target="_blank" {...rest}>
      {children}
    </a>
  );
}

function Table(props: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="scroll-region" role="region" aria-label="Table" tabIndex={0}>
      <table {...props} />
    </div>
  );
}

function Figure({ src, caption }: { src: string; caption?: string }) {
  return <EditorialImage src={src} caption={caption} sizes="(min-width: 768px) 42rem, 100vw" className="not-prose my-10" showKindLabel />;
}

const components = {
  a: SmartLink,
  table: Table,
  Callout,
  Checklist,
  ComparisonTable,
  ProsCons,
  SuitsSkip,
  ProductCard,
  ProductComparison,
  ShopOnAmazon,
  Figure,
};

export async function MdxContent({ source }: { source: string }) {
  const { content } = await compileMDX({
    source,
    components,
    options: {
      parseFrontmatter: false,
      // Content is first-party and reviewed; allow literal props like pros={[...]}
      // but keep dangerous JS (eval, Function, globals) blocked.
      blockJS: false,
      blockDangerousJS: true,
      mdxOptions: { remarkPlugins: [remarkGfm], rehypePlugins: [rehypeSlug], format: "mdx" },
    },
  });
  return <div className="article-prose">{content}</div>;
}
