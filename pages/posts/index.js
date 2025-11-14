import Base from "@layouts/Baseof";
import Pagination from "@layouts/components/Pagination";
import Post from "@layouts/partials/Post";
import Sidebar from "@layouts/partials/Sidebar";
import { markdownify } from "@lib/utils/textConverter";

// ---------------------------
// WORDPRESS API
// ---------------------------
const WP_BASE = "https://mindsetpalette.com/wp-json/wp/v2";

async function getWPPosts(limit = 50) {
  const res = await fetch(`${WP_BASE}/posts?per_page=${limit}&_embed`);
  return await res.json();
}

const BlogPosts = ({ posts, categories }) => {
  return (
    <Base title="All Posts">
      <section className="section">
        <div className="container">
          <div className="row items-start">
            {/* Left Column */}
            <div className="mb-12 lg:mb-0 lg:col-8">
              <h1 className="section-title mb-10">All Posts</h1>

              <div className="row">
                {posts.map((post) => (
                  <div className="mb-8 md:col-6" key={post.slug}>
                    <Post post={post} />
                  </div>
                ))}
              </div>

              <Pagination totalPages={1} currentPage={1} />
            </div>

            {/* Sidebar */}
            <Sidebar
              className={"lg:mt-[5rem]"}
              posts={posts}
              categories={categories}
            />
          </div>
        </div>
      </section>
    </Base>
  );
};

export default BlogPosts;

// ---------------------------------
// DATA LOADING (WORDPRESS)
// ---------------------------------
export const getStaticProps = async () => {
  const wp = await getWPPosts(50);

  // convert WP → theme format
  const posts = wp.map((p) => ({
    slug: p.slug,
    frontmatter: {
      title: p.title.rendered,
      date: p.date,
      categories: [],
      image:
        p._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
        "/images/default.jpg",
    },
    content: p.content.rendered,
  }));

  return {
    props: {
      posts,
      categories: [],
    },
    revalidate: 60,
  };
};
