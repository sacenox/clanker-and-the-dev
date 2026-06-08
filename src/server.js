import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { html, raw } from 'hono/html';
import { marked } from 'marked';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const app = new Hono();
const POSTS_DIR = path.join(process.cwd(), 'posts');
const PORT = Number(process.env.PORT || 3000);
const SITE_TITLE = 'Clanker and the Dev';
const SITE_TAGLINE = 'terminal comics from the build log';

marked.setOptions({
  gfm: true,
  breaks: true,
});

function parseFrontmatter(source) {
  const match = source.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!match) return { metadata: {}, body: source };

  const metadata = {};
  for (const line of match[1].split('\n')) {
    const separator = line.indexOf(':');
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim();
    const rawValue = line.slice(separator + 1).trim();
    metadata[key] = rawValue.replace(/^['"]|['"]$/g, '');
  }

  return { metadata, body: match[2] };
}

function jekyllMetadataFromFilename(filename) {
  const match = filename.match(/^(\d{4}-\d{2}-\d{2})-(.+)\.md$/);
  if (!match) return {};
  return { timestamp: match[1], slug: match[2] };
}

async function getPosts() {
  const files = (await readdir(POSTS_DIR)).filter((file) => file.endsWith('.md'));
  const posts = await Promise.all(
    files.map(async (file) => {
      const source = await readFile(path.join(POSTS_DIR, file), 'utf8');
      const { metadata, body } = parseFrontmatter(source);
      const filenameMetadata = jekyllMetadataFromFilename(file);
      const slug = metadata.slug || filenameMetadata.slug || file.replace(/\.md$/, '');
      const name = metadata.name || slug.replaceAll('-', ' ');
      const timestamp = metadata.timestamp || filenameMetadata.timestamp || '';

      return {
        file,
        slug,
        name,
        timestamp,
        body,
        html: marked.parse(body),
      };
    }),
  );

  return posts.sort((a, b) => String(b.timestamp).localeCompare(String(a.timestamp)));
}

async function getPost(slug) {
  const posts = await getPosts();
  return posts.find((post) => post.slug === slug);
}

const postHref = (post) => `/posts/${encodeURIComponent(post.slug)}`;
const postPartialHref = (post) => `/partials/posts/${encodeURIComponent(post.slug)}`;

const Page = ({ title = SITE_TITLE, posts, children }) => html`<!doctype html>
  <html lang="en">
    ${Head({ title })}
    <body class="scanlines min-h-screen bg-black text-green-400 selection:bg-green-900 selection:text-green-100">
      ${AppShell({ posts, children })}
    </body>
  </html>`;

const Head = ({ title }) => html`<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/htmx.org@2.0.4"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=VT323&display=swap" rel="stylesheet" />
  ${GlobalStyles()}
</head>`;

const GlobalStyles = () => html`<style>
  :root { color-scheme: dark; }
  body { font-family: 'VT323', 'Courier New', monospace; }
  .scanlines::before {
    content: '';
    pointer-events: none;
    position: fixed;
    inset: 0;
    background: repeating-linear-gradient(
      to bottom,
      rgba(255,255,255,0.03),
      rgba(255,255,255,0.03) 1px,
      transparent 1px,
      transparent 4px
    );
    mix-blend-mode: screen;
  }
  .post-content h1 { font-size: 2.25rem; line-height: 1; margin-bottom: 1rem; color: #86efac; }
  .post-content h2 { font-size: 1.75rem; margin-top: 1.5rem; color: #bbf7d0; }
  .post-content p { margin: 1rem 0; }
  .post-content a { color: #22c55e; text-decoration: underline; }
  .post-content img { border: 1px solid #166534; background: #020617; padding: 0.5rem; max-width: 100%; }
  .post-content pre { border: 1px solid #14532d; padding: 1rem; overflow-x: auto; background: #020617; }
</style>`;

const AppShell = ({ posts, children }) => html`<div class="min-h-screen border-green-950 md:grid md:grid-cols-[19rem_1fr]">
  ${Sidebar({ posts })}
  <main id="main" class="min-h-screen border-green-950 p-6 md:border-l lg:p-10">
    ${children}
  </main>
</div>`;

const Sidebar = ({ posts }) => html`<aside class="border-b border-green-950 bg-zinc-950/90 p-5 md:min-h-screen md:border-b-0">
  ${SiteMark()}
  <p class="mt-3 text-lg text-green-700">${SITE_TAGLINE}</p>
  ${PostHistory({ posts })}
</aside>`;

const SiteMark = () => html`<a
  href="/"
  hx-get="/partials/home"
  hx-target="#main"
  hx-push-url="/"
  class="block border border-green-800 bg-black p-4 text-3xl uppercase tracking-widest text-green-300 shadow-[0_0_20px_rgba(34,197,94,0.12)]"
>
  Clanker<br />&amp; the Dev
</a>`;

const PostHistory = ({ posts }) => html`<nav class="mt-8">
  <h2 class="border-b border-green-900 pb-2 text-xl uppercase text-green-500">Post history</h2>
  <ol class="mt-3 space-y-2">
    ${posts.map((post) => PostHistoryItem({ post }))}
  </ol>
</nav>`;

const PostHistoryItem = ({ post }) => html`<li>
  <a
    href="${postHref(post)}"
    hx-get="${postPartialHref(post)}"
    hx-target="#main"
    hx-push-url="${postHref(post)}"
    class="block border border-zinc-800 bg-zinc-950 p-3 text-xl text-green-300 hover:border-green-700 hover:bg-green-950/30"
  >
    <span class="block text-sm text-green-700">${post.timestamp || 'undated'}</span>
    ${post.name}
  </a>
</li>`;

const HomePage = () => html`<section class="mx-auto max-w-4xl">
  <div class="border border-green-800 bg-zinc-950 p-6 shadow-[0_0_35px_rgba(34,197,94,0.08)]">
    <p class="text-lg uppercase tracking-[0.45em] text-green-700">boot sequence complete</p>
    <h1 class="mt-4 text-5xl text-green-200 md:text-7xl">${SITE_TITLE}</h1>
    <p class="mt-6 max-w-2xl text-2xl text-green-400">
      A minimal proof-of-concept for a comic-strip blog: markdown posts, a left-side archive,
      HTMX navigation, and a glowing black-and-green terminal vibe.
    </p>
  </div>
</section>`;

const PostPage = ({ post }) => html`<article class="post-content mx-auto max-w-4xl">
  <header class="mb-6 border border-green-900 bg-zinc-950 p-5">
    <p class="text-lg uppercase tracking-[0.35em] text-green-700">${post.timestamp || 'undated'}</p>
    <h1 class="mt-2 text-5xl text-green-200">${post.name}</h1>
  </header>
  ${MarkdownPanel({ html: post.html })}
</article>`;

const MarkdownPanel = ({ html: markdownHtml }) => html`<div class="border border-zinc-800 bg-black p-5 text-2xl leading-relaxed text-green-300">
  ${raw(markdownHtml)}
</div>`;

const NotFoundPage = () => html`<section class="border border-green-900 bg-zinc-950 p-6 text-2xl text-green-300">
  <h1 class="text-5xl text-green-200">404</h1>
  <p class="mt-3">Signal lost. This strip is not in the archive.</p>
</section>`;

app.get('/', async (c) => {
  const posts = await getPosts();
  return c.html(Page({ posts, children: HomePage() }));
});

app.get('/posts/:slug', async (c) => {
  const posts = await getPosts();
  const post = posts.find((item) => item.slug === c.req.param('slug'));
  if (!post) return c.html(Page({ posts, title: `404 | ${SITE_TITLE}`, children: NotFoundPage() }), 404);
  return c.html(Page({ posts, title: `${post.name} | ${SITE_TITLE}`, children: PostPage({ post }) }));
});

app.get('/partials/home', (c) => c.html(HomePage()));

app.get('/partials/posts/:slug', async (c) => {
  const post = await getPost(c.req.param('slug'));
  if (!post) return c.html(NotFoundPage(), 404);
  return c.html(PostPage({ post }));
});

app.notFound(async (c) => {
  const posts = await getPosts();
  return c.html(Page({ posts, title: `404 | ${SITE_TITLE}`, children: NotFoundPage() }), 404);
});

serve({ fetch: app.fetch, port: PORT }, (info) => {
  console.log(`${SITE_TITLE} listening on http://localhost:${info.port}`);
});
