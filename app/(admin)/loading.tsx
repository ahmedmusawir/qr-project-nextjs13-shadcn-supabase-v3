import Spinner from "@/components/common/Spinner";
import React from "react";

const Loading = () => {
  console.log("[app/admin/loading] We are stuck here");

  return (
    <div>
      <Spinner />
    </div>
  );
};

export default Loading;
