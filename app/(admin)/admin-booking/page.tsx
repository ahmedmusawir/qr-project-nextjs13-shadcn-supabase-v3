import React from "react";
import BackButton from "@/components/common/BackButton";
import InsertForm from "./InsertForm";

const PostInsertPage = () => {
  return (
    <section className="p-5">
      <BackButton text="Back To Portal" link="/admin-portal" />

      <InsertForm />
    </section>
  );
};

export default PostInsertPage;
