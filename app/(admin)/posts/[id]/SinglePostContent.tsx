import Page from "@/components/common/Page";
import Row from "@/components/common/Row";
import Head from "next/head";
import { Post } from "@/types/posts";
import { Button } from "@/components/ui/button";

interface SinglePostContentProps {
  post: Post;
}

const SinglePostContent = ({ post }: SinglePostContentProps) => {
  return (
    <>
      <Head>
        <title>{post.title}</title>
        <meta name="description" content={post.body.substring(0, 160)} />
      </Head>
      <Page className={""} FULL={false}>
        <Row className="">
          <h1 className="h1 mb-5">{post.title}</h1>
          <h5 className="italic text-gray-500 mb-5">
            Created on: {post.created_at}
          </h5>
          <p className="mb-5">{post.body}</p>
          <h5 className="italic">By {post.author}</h5>
          <h3 className="h3 mt-6">Status</h3>
          <div className="list-inside p-5 bg-green-700">Booking Confirmed</div>
          <Button
            className="bg-red-700 hover:bg-red-600 text-white mt-10"
            size={"lg"}
            disabled
          >
            Confirm Booking
          </Button>
        </Row>
      </Page>
    </>
  );
};

export default SinglePostContent;
