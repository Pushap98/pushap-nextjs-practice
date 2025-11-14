import Base from "@layouts/Baseof";
import ImageFallback from "@layouts/components/ImageFallback";
import Pagination from "@layouts/components/Pagination";
import Post from "@layouts/partials/Post";
import Sidebar from "@layouts/partials/Sidebar";
import { markdownify } from "@lib/utils/textConverter";
import Link from "next/link";
import { FaRegCalendar } from "react-icons/fa";

// ---------------------------------
// WORDPRESS HELPERS
// ---------------------------------
const WP_BASE = "https://mindsetpalette.com/wp-json/wp/v2";

async function getWPPosts(limit = 20) {
  const res = await fetch(`${WP_BASE}/posts?per_page=${limit}&_embed`);
  return await res.json();
}

// ---------------------------------
// HOMEPAGE COMPONENT
// ---------------------------------
const Home = ({
  banner,
  featuredPost,
  recentPosts = [],
  allPosts = [],
  categories = [],
  promotion,
}) => {
  return (
    <Base>
      {/* Banner */}
      <section className="section banner relative pb-0">
        <ImageFallback
          className="absolute bottom-0 left-0 z-[-1] w-full"
          src={"/images/banner-bg-shape.svg"}
          width={1905}
          height={295}
          alt="banner-shape"
          priority
        />

        <div className="container">
          <div className="row flex-wrap-reverse items-center justify-center lg:flex-row">
            <div
              className={
                banner.image_enable
                  ? "mt-12 text-center lg:mt-0 lg:text-left lg:col-6"
                  : "mt-12 text-center lg:mt-0 lg:text-left lg:col-12"
              }
            >
              <div className="banner-title">
                {markdownify(banner.title, "h1")}
                {markdownify(banner.title_small, "span")}
              </div>

              {markdownify(banner.content, "p", "mt-4")}

              {banner.button.enable && (
                <Link
                  className="btn btn-primary mt-6"
                  href={banner.button.link}
                  rel={banner.button.rel}
                >
                  {banner.button.label}
                </Link>
              )}
            </div>

            {banner.image_enable && (
              <div className="col-9 lg:col-6">
                <ImageFallback
                  className="mx-auto object-contain"
                  src={banner.image}
                  width={548}
                  height={443}
                  alt="Banner Image"
                  priority
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main */}
      <section className="section">
        <div className="container">
          <div className="row items-start">
            <div className="mb-12 lg:mb-0 lg:col-8">

              {/* Featured Post */}
              {featuredPost && (
                <div className="section">
                  <h2 className="section-title">Featured Post</h2>

                  <div className="rounded border border-border p-6 dark:border-darkmode-border">
                    <div className="row">

                      {/* Left big featured */}
                      <div className="md:col-6">
                        <Post post={featuredPost} />
                      </div>

                      {/* Right scroll list */}
                      <div className="scrollbar-w-[10px] mt-8 max-h-[480px] scrollbar-thin md:mt-0 md:col-6">
                        {recentPosts.slice(1, 5).map((post, i, arr) => (
                          <div
                            className={`mb-6 flex items-center pb-6 ${
                              i !== arr.length - 1 &&
                              "border-b border-border dark:border-darkmode-border"
                            }`}
                            key={post.slug}
                          >
                            {post.frontmatter.image && (
                              <ImageFallback
                                className="mr-3 h-[85px] rounded object-cover"
                                src={post.frontmatter.image}
                                alt={post.frontmatter.title}
                                width={105}
                                height={85}
                              />
                            )}

                            <div>
                              <h3 className="h5 mb-2">
                                <Link
                                  href={`/posts/${post.slug}`}
                                  className="block hover:text-primary"
                                >
                                  {post.frontmatter.title}
                                </Link>
                              </h3>

                              <p className="inline-flex items-center font-bold">
                                <FaRegCalendar className="mr-1.5" />
                                {new Date(post.frontmatter.date).toDateString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                    </div>
                  </div>
                </div>
              )}

              {/* Recent Posts */}
              {recentPosts.length > 0 && (
                <div className="section pt-0">
                  <h2 className="section-title">Recent Posts</h2>

                  <div className="rounded border border-border px-6 pt-6 dark:border-darkmode-border">
                    <div className="row">
                      {recentPosts.map((post) => (
                        <div className="mb-8 md:col-6" key={post.slug}>
                          <Post post={post} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <Pagination totalPages={1} currentPage={1} />
            </div>

            {/* Sidebar */}
            <Sidebar
              className={"lg:mt-[9.5rem]"}
              posts={allPosts}
              categories={categories}
            />
          </div>
        </div>
      </section>
    </Base>
  );
};

// ---------------------------------
// DATA LOADING (WORDPRESS)
// ---------------------------------
export const getStaticProps = async () => {
  const wpPosts = await getWPPosts(20);

  // Convert WordPress posts → theme structure
  const all = wpPosts.map((p) => ({
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
      banner: {
        title: "Welcome to Mindset Palette",
        title_small: "",
        content: "",
        image_enable: false,
        button: { enable: false },
      },

      featuredPost: all[0] || null,
      recentPosts: all,
      allPosts: all,
      categories: [],
      promotion: { enable: false },
    },
    revalidate: 60,
  };
};

export default Home;
