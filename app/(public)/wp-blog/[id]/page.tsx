"use client"; // For using hooks in client-side rendering

import Page from "@/components/common/Page";
import Row from "@/components/common/Row";
import Head from "next/head";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation"; // Use this to grab the dynamic route params
import Spinner from "@/components/common/Spinner";
import styles from "./PostContent.module.scss";
import BackButton from "@/components/common/BackButton";

interface Post {
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
}

const WPPost = () => {
  const [post, setPost] = useState<Post | null>(null);
  const params = useParams(); // Get the 'id' from the URL dynamically
  const { id } = params; // Destructure the id from the params object

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(
          `https://cyberizegroup.com/wp-json/wp/v2/posts/${id}`,
          { cache: "force-cache", next: { revalidate: 60 } }
          // { cache: "no-cache" }
        );
        const data = await res.json();
        setPost(data);
      } catch (error) {
        console.error("Error fetching the post:", error);
      }
    };

    if (id) {
      fetchPost();
    }
  }, [id]);

  if (!post) return <Spinner />;

  return (
    <>
      <Head>
        <title>{post.title.rendered}</title>
        <meta name="description" content={`Post: ${post.title.rendered}`} />
      </Head>
      <Page className={""} FULL={false}>
        <Row className="prose max-w-3xl mx-auto bg-gray-200">
          {/* <h1 className="h1 text-center">{post.title.rendered}</h1> */}
          <BackButton text="Go Back..." />
          <div
            className={styles["wp-content"]}
            dangerouslySetInnerHTML={{ __html: post.content.rendered }}
          />
        </Row>
      </Page>
    </>
  );
};

export default WPPost;
