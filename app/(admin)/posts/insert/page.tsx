import React from "react";
import BackButton from "@/components/common/BackButton";
import InsertForm from "./InsertForm";

const PostInsertPage = () => {
  return (
    <section className="p-8">
      <BackButton text="Back To Posts" link="/posts" />

      <InsertForm />
    </section>
  );
};

export default PostInsertPage;
