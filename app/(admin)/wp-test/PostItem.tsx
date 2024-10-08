import Link from "next/link";
import { WPost } from "./WPPostContent";
import { Button } from "@/components/ui/button";

const posts = [
  {
    id: 1,
    title: "Boost your conversion rate",
    href: "#",
    description:
      "Illo sint voluptas. Error voluptates culpa eligendi. Hic vel totam vitae illo. Non aliquid explicabo necessitatibus unde. Sed exercitationem placeat consectetur nulla deserunt vel. Iusto corrupti dicta.",
    imageUrl:
      "https://images.unsplash.com/photo-1496128858413-b36217c2ce36?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3603&q=80",
    date: "Mar 16, 2020",
    datetime: "2020-03-16",
    category: { title: "Marketing", href: "#" },
    author: {
      name: "Michael Foster",
      role: "Co-Founder / CTO",
      href: "#",
      imageUrl:
        "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
  },
  // More posts...
];

interface Posts {
  posts: WPost[];
}

const PostItem = ({ posts }: Posts) => {
  return (
    <div className="bg-gray-300 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Fresh From the Cyberize blog
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
                    "https://res.cloudinary.com/dyb0qa58h/image/upload/v1725342258/twitter_image_1_fbzb6m.png"
                  }
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
                      href={`/wp-test/${post.id}`}
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
                  href={`/wp-test/${post.id}`}
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
