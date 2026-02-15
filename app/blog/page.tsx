// Create this file: app/blog/page.tsx

import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import {
  NewspaperIcon,
  ClockIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

export const metadata = {
  title: "Blog - Edmich Autoplux",
  description:
    "Latest news, tips, and insights about auto parts and automotive industry in Nigeria.",
};

export default function BlogPage() {
  const categories = [
    "All Posts",
    "Industry News",
    "Maintenance Tips",
    "Product Guides",
    "Company Updates",
  ];

  const featuredPost = {
    title: "How to Choose the Right Auto Parts for Your Vehicle",
    excerpt:
      "A comprehensive guide to selecting quality auto parts that match your vehicle's specifications.",
    author: "Edmich Team",
    date: "November 10, 2025",
    readTime: "5 min read",
    category: "Product Guides",
  };

  const posts = [
    {
      title: "Top 10 Signs Your Brake Pads Need Replacement",
      excerpt:
        "Learn to recognize warning signs before they become a safety hazard.",
      author: "John Mechanic",
      date: "November 8, 2025",
      readTime: "4 min read",
      category: "Maintenance Tips",
    },
    {
      title: "Edmich Autoplux Expands to 10 New States",
      excerpt:
        "We're bringing quality auto parts closer to you across Nigeria.",
      author: "Edmich Team",
      date: "November 5, 2025",
      readTime: "3 min read",
      category: "Company Updates",
    },
    {
      title: "Understanding Engine Oil Grades: Complete Guide",
      excerpt: "Learn which oil grade is best for your vehicle's engine.",
      author: "Sarah Expert",
      date: "November 1, 2025",
      readTime: "6 min read",
      category: "Maintenance Tips",
    },
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-white via-neutral-50 to-white">
        <section className="pt-32 pb-16 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-600 text-white">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <NewspaperIcon className="h-20 w-20 mx-auto mb-6 opacity-90" />
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Edmich Blog</h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Insights, tips, and news from the automotive world
            </p>
          </div>
        </section>

        <section className="py-8 bg-white border-b-2 border-neutral-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex gap-3 overflow-x-auto">
              {categories.map((cat, i) => (
                <button
                  key={i}
                  className={`px-6 py-2 rounded-full font-semibold whitespace-nowrap ${
                    i === 0
                      ? "bg-blue-600 text-white"
                      : "bg-neutral-100 text-neutral-700"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-neutral-900 mb-8">
            Featured Article
          </h2>
          <div className="bg-white rounded-3xl border-2 border-neutral-200 hover:shadow-2xl transition-all p-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                {featuredPost.category}
              </span>
              <span className="text-sm text-neutral-600">
                {featuredPost.readTime}
              </span>
            </div>
            <h3 className="text-3xl font-bold text-neutral-900 mb-4">
              {featuredPost.title}
            </h3>
            <p className="text-lg text-neutral-600 mb-6">
              {featuredPost.excerpt}
            </p>
            <div className="flex gap-4 text-sm text-neutral-600">
              <div className="flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                {featuredPost.author}
              </div>
              <div className="flex items-center gap-2">
                <ClockIcon className="h-4 w-4" />
                {featuredPost.date}
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-neutral-900 mb-8">
            Recent Articles From Edmich Team
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, i) => (
              <article
                key={i}
                className="bg-white rounded-2xl border-2 border-neutral-200 hover:shadow-xl transition-all p-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                    {post.category}
                  </span>
                  <span className="text-xs text-neutral-600">
                    {post.readTime}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-3">
                  {post.title}
                </h3>
                <p className="text-neutral-600 mb-4">{post.excerpt}</p>
                <div className="flex gap-4 text-xs text-neutral-600 pt-4 border-t">
                  <div className="flex items-center gap-1">
                    <UserIcon className="h-3 w-3" />
                    {post.author}
                  </div>
                  <div className="flex items-center gap-1">
                    <ClockIcon className="h-3 w-3" />
                    {post.date}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="py-16 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-600">
          <div className="max-w-4xl mx-auto px-6 text-center text-white">
            <div className="flex gap-4 max-w-2xl mx-auto"></div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
