const BASE = process.env.NEXT_PUBLIC_WORDPRESS_REST;

export async function getPosts() {
  const res = await fetch(`${BASE}/posts?per_page=20&_embed`);
  return await res.json();
}

export async function getPost(slug) {
  const res = await fetch(`${BASE}/posts?slug=${slug}&_embed`);
  const data = await res.json();
  return data[0] || null;
}
