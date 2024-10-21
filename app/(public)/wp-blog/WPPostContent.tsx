"use client";

import Page from "@/components/common/Page";
import Row from "@/components/common/Row";
import Spinner from "@/components/common/Spinner";
import Head from "next/head";
import React, { useEffect, useState } from "react";
import PostItem from "./PostItem";

export interface WPost {
  id: number;
  title: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  featured_image_url?: string; // Added this to handle the featured image
}

const WPPostContent = () => {
  const [posts, setPosts] = useState<WPost[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const res = await fetch(
        "https://cyberizegroup.com/wp-json/wp/v2/posts?_embed", // Added the `_embed` to fetch featured images
        {
          cache: "force-cache",
          next: { revalidate: 60 },
        }
      );
      const data = await res.json();

      // Extract necessary fields including the featured image URL
      const formattedPosts: WPost[] = data.map((post: any) => ({
        id: post.id,
        title: post.title,
        excerpt: post.excerpt,
        featured_image_url:
          post._embedded?.["wp:featuredmedia"]?.[0]?.media_details?.sizes?.large
            ?.source_url || "", // Extracting the featured image URL
      }));

      setPosts(formattedPosts);
    };

    fetchPosts();
  }, []);

  return (
    <>
      <Head>
        <title>WP Post List</title>
        <meta name="description" content="WordPress Blog Post List" />
      </Head>
      <Page className={""} FULL={false}>
        <Row className="prose max-w-3xl mx-auto">
          {posts.length === 0 ? <Spinner /> : <PostItem posts={posts} />}
        </Row>
      </Page>
    </>
  );
};

export default WPPostContent;
