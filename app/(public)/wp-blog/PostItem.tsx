import Link from "next/link";
import { WPost } from "./WPPostContent";
import { Button } from "@/components/ui/button";
import BackButton from "@/components/common/BackButton";

interface Posts {
  posts: WPost[];
}

const PostItem = ({ posts }: Posts) => {
  return (
    <div className="bg-gray-200 py-4 sm:py-3">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mt-10">
          <BackButton text="Back Home" />
        </div>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Cyberize Blog
          </h2>
          <p className="mt-2 text-lg leading-8 text-gray-600">
            Learn how to grow your business with our expert advice.
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post.id}
              className="flex flex-col items-start justify-between shadow-xl p-5 bg-white"
            >
              <div className="relative w-full">
                <img
                  alt=""
                  src={
                    post.featured_image_url
                      ? post.featured_image_url
                      : "https://res.cloudinary.com/dyb0qa58h/image/upload/v1725342258/twitter_image_1_fbzb6m.png"
                  }
                  // src={
                  //   "https://res.cloudinary.com/dyb0qa58h/image/upload/v1725342258/twitter_image_1_fbzb6m.png"
                  // }
                  className="aspect-[16/9] w-full rounded-2xl bg-gray-100 object-cover sm:aspect-[2/1] lg:aspect-[3/2]"
                />
                {/* <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gray-900/10" /> */}
              </div>
              <div className="max-w-xl">
                <div className="mt-8 flex items-center gap-x-4 text-xs">
                  <time dateTime={"Oct 7, 2024"} className="text-gray-500">
                    <p>Oct 7, 2024</p>
                  </time>
                  <a
                    href={"#"}
                    className="relative z-10 rounded-full bg-gray-50 px-3 py-1.5 font-medium text-gray-600 hover:bg-gray-100"
                  >
                    Simplified Local Growth
                  </a>
                </div>
                <div className="group relative">
                  <h2 className="mt-3 text-lg font-bold leading-6 text-gray-900 group-hover:text-gray-600 no-underline">
                    <Link
                      href={`/wp-blog/${post.id}`}
                      className="text-blue-600 no-underline hover:text-blue-400"
                    >
                      <span
                        // className={styles["wp-content"]}
                        dangerouslySetInnerHTML={{
                          __html: post.title.rendered,
                        }}
                      />
                    </Link>
                  </h2>
                  <span
                    dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
                    className="mt-5 line-clamp-3 text-sm leading-6 text-gray-600"
                  />
                </div>
                <div className="relative mt-8 flex items-center gap-x-4">
                  <img
                    alt=""
                    // src={post.featured_image_url}
                    src={
                      "https://res.cloudinary.com/dyb0qa58h/image/upload/v1716355016/cs3ul9pgyxf9o40rz2gf.png"
                    }
                    className="h-10 w-10 rounded-full bg-gray-100"
                  />
                  <div className="text-sm leading-6">
                    <p className="font-semibold text-gray-900">
                      <a href={""}>
                        <span className="absolute inset-0" />
                        The Moose
                      </a>
                    </p>
                    <p className="text-gray-600">Chief Engineer</p>
                  </div>
                </div>
                <Link
                  href={`/wp-blog/${post.id}`}
                  className="text-blue-500 hover:underline"
                >
                  <Button className="bg-indigo-700 hover:bg-indigo-500 text-white">
                    {" "}
                    Read More
                  </Button>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PostItem;
