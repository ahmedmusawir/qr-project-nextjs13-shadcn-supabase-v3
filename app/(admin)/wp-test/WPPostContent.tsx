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
        // next: { revalidate: 60 },

        cache: "no-cache",
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
        <Link className="float-end" href="/admin-event">
          <Button className="bg-gray-700 hover:bg-gray-600 text-white">
            Create Event
          </Button>
        </Link>
        <Row className="prose max-w-3xl mx-auto">
          <h1 className="h1 text-center">WordPress Blog Posts</h1>
          {posts.length === 0 ? <Spinner /> : <PostItem posts={posts} />}
        </Row>
      </Page>
    </>
  );
};

export default WPPostContent;
