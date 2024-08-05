import BackButton from "@/components/common/BackButton";
import EditForm from "./EditForm";

interface PostEditPageProps {
  params: {
    id: number;
  };
}

const PostEditPage = async ({ params }: PostEditPageProps) => {
  const postId = params.id;

  return (
    <section className="p-8">
      <BackButton text="Back To Posts" link="/posts" />
      <EditForm postId={postId} />
    </section>
  );
};

export default PostEditPage;
