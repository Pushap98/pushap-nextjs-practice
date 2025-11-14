import Base from "@layouts/Baseof";
import ImageFallback from "@layouts/components/ImageFallback";
import Sidebar from "@layouts/partials/Sidebar";
import { markdownify } from "@lib/utils/textConverter";
import { useRouter } from "next/router";

// ---------------------------
// WORDPRESS API
// ---------------------------
const WP_BASE = "https://mindsetpalette.com/wp-json/wp/v2";

async function getWPPost(slug) {
  const res = await fetch(`${WP_BASE}/posts?slug=${slug}&_embed`);
  const data = await res.json();
  return data[0] || null;
}

async function getWPPosts(limit = 50) {
  const res = await fetch(`${WP_BASE}/posts?per_page=${limit}&_embed`);
  return await res.json();
}

const SinglePost = ({ post, allPosts }) => {
  const router = useRouter();
  if (router.isFallback) return <div>Loading…</div>;

  if (!post) return <div>Post not found</div>;

  return (
    <Base title={post.frontmatter.title}>
      <section className="section pt-0">
        <div className="container">
          <div className="row justify-center">
            {/* Main Post Content */}
            <article className="lg:col-8">
              <h1 className="mb-4">{post.frontmatter.title}</h1>

              {post.frontmatter.image && (
                <ImageFallback
                  className="rounded mb-6"
                  src={post.frontmatter.image}
                  width={800}
                  height={450}
                  alt="Featured Image"
                />
              )}

              {/* WORDPRESS HTML CONTENT */}
              <div
                className="content"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </article>

            {/* Sidebar */}
            <Sidebar
              className={"lg:mt-[3rem]"}
              posts={allPosts}
              categories={[]}
            />
          </div>
        </div>
      </section>
    </Base>
  );
};

export default SinglePost;

// ------------------
// PAGE GENERATION
// ------------------
export async function getStaticPaths() {
  const wp = await getWPPosts(50);

  const paths = wp.map((p) => ({
    params: { single: p.slug },
  }));

  return {
    paths,
    fallback: "blocking",
  };
}

export async function getStaticProps({ params }) {
  const postData = await getWPPost(params.single);
  const all = await getWPPosts(50);

  if (!postData) {
    return { notFound: true };
  }

  const post = {
    slug: postData.slug,
    frontmatter: {
      title: postData.title.rendered,
      date: postData.date,
      categories: [],
      image:
        postData._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
        "/images/default.jpg",
    },
    content: postData.content.rendered,
  };

  const allPosts = all.map((p) => ({
    slug: p.slug,
    frontmatter: {
      title: p.title.rendered,
      date: p.date,
      categories: [],
      image:
        p._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
        "/images/default.jpg",
    },
  }));

  return {
    props: {
      post,
      allPosts,
    },
    revalidate: 60,
  };
}
