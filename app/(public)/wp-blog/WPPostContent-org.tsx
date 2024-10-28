"use client";

import Page from "@/components/common/Page";
import Row from "@/components/common/Row";
import Spinner from "@/components/common/Spinner";
import { Button } from "@/components/ui/button";
import Head from "next/head";
import Link from "next/link";
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
}

const WPPostContent = () => {
  const [posts, setPosts] = useState<WPost[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const res = await fetch("https://cyberizegroup.com/wp-json/wp/v2/posts", {
        // cache: "force-cache",
        // cache: "no-cache",
        // next: { revalidate: 60 },
        cache: "force-cache",
        next: { revalidate: 60 },
      });
      const data = await res.json();
      setPosts(data);
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
          {/* <h1 className="h1 text-center">WordPress Blog Posts</h1> */}
          {posts.length === 0 ? <Spinner /> : <PostItem posts={posts} />}
        </Row>
      </Page>
    </>
  );
};

export default WPPostContent;
