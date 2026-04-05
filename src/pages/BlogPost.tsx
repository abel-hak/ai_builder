import { useParams, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { blogPosts } from "./Blog";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) return <Navigate to="/blog" replace />;

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={14} />
            All Posts
          </Link>
        </div>
      </div>

      <article className="max-w-2xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-6">
            <span className="inline-flex items-center gap-1">
              <Calendar size={12} />
              {new Date(post.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock size={12} />
              {post.readTime} read
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-normal leading-[1.15] mb-6">
            {post.title}
          </h1>

          {/* Tags */}
          <div className="flex items-center gap-2 mb-10 pb-10 border-b border-border">
            {post.tags.map((tag) => (
              <span key={tag} className="text-xs px-2.5 py-1 rounded-md bg-secondary text-muted-foreground">
                {tag}
              </span>
            ))}
          </div>

          {/* Content */}
          <div className="prose-custom">
            <ReactMarkdown
              components={{
                h2: ({ children }) => (
                  <h2 className="text-xl font-medium text-foreground mt-10 mb-4">{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-lg font-medium text-foreground mt-8 mb-3">{children}</h3>
                ),
                p: ({ children }) => (
                  <p className="text-foreground/80 leading-[1.8] mb-5">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-outside ml-5 mb-5 space-y-1.5 text-foreground/80">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-outside ml-5 mb-5 space-y-1.5 text-foreground/80">{children}</ol>
                ),
                li: ({ children }) => (
                  <li className="leading-[1.7]">{children}</li>
                ),
                strong: ({ children }) => (
                  <strong className="text-foreground font-medium">{children}</strong>
                ),
                code: ({ className, children }) => {
                  const isInline = !className;
                  if (isInline) {
                    return (
                      <code className="text-sm bg-secondary px-1.5 py-0.5 rounded text-primary font-mono">
                        {children}
                      </code>
                    );
                  }
                  return (
                    <code className={className}>{children}</code>
                  );
                },
                pre: ({ children }) => (
                  <pre className="bg-card border border-border rounded-lg p-4 mb-5 overflow-x-auto text-sm font-mono leading-relaxed">
                    {children}
                  </pre>
                ),
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>

          {/* Footer nav */}
          <div className="mt-16 pt-8 border-t border-border">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={14} />
              Back to all posts
            </Link>
          </div>
        </motion.div>
      </article>
    </main>
  );
};

export default BlogPost;
