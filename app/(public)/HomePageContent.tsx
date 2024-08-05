import Box from "@/components/common/Box";
import Page from "@/components/common/Page";
import Row from "@/components/common/Row";
import { Button } from "@/components/ui/button";
import Head from "next/head";
import Link from "next/link";
import React, { ReactNode } from "react";

const HomePageContent = () => {
  return (
    <>
      <Head>
        <title>HomePageContent</title>
        <meta name="description" content="This is the home page" />
      </Head>
      <Page className={"border border-gray-300"} FULL={false}>
        <Row className={"min-w-full text-center my-5"}>
          <h2>Cyberize AI Power Events</h2>
        </Row>
        <Row className={"grid gap-3 grid-auto-fit p-3"}>
          <Box className={"p-1"}>
            <img
              src="https://picsum.photos/id/62/350/300"
              className="mb-3 min-w-full"
              alt=""
            />
            <p>
              Lorem ipsum dolor, sit amet consectetur adipisicing elit. Possimus
              et, ex eum rem mollitia totam eius ad, sapiente eos maiores
              voluptatum, explicabo harum quos dolores nemo eaque reprehenderit
              quo. Iure.
            </p>
            <Link className="float-end" href="/booking">
              <Button className="bg-green-700 hover:bg-green-600 text-white my-5">
                Book Now
              </Button>
            </Link>
          </Box>
          <Box className={"p-1"}>
            <img
              src="https://picsum.photos/id/63/350/300"
              className="mb-3 min-w-full"
              alt=""
            />
            <p>
              Lorem ipsum dolor, sit amet consectetur adipisicing elit. Possimus
              et, ex eum rem mollitia totam eius ad, sapiente eos maiores
              voluptatum, explicabo harum quos dolores nemo eaque reprehenderit
              quo. Iure.
            </p>
            <Link className="float-end" href="/booking">
              <Button className="bg-green-700 hover:bg-green-600 text-white my-5">
                Book Now
              </Button>
            </Link>
          </Box>
          <Box className={"p-1"}>
            <img
              src="https://picsum.photos/id/64/350/300"
              className="mb-3 min-w-full"
              alt=""
            />
            <p>
              Lorem ipsum dolor, sit amet consectetur adipisicing elit. Possimus
              et, ex eum rem mollitia totam eius ad, sapiente eos maiores
              voluptatum, explicabo harum quos dolores nemo eaque reprehenderit
              quo. Iure.
            </p>
            <Link className="float-end" href="/booking">
              <Button className="bg-green-700 hover:bg-green-600 text-white my-5">
                Book Now
              </Button>
            </Link>
          </Box>
          <Box className={"p-1"}>
            <img
              src="https://picsum.photos/id/65/350/300"
              className="mb-3 min-w-full"
              alt=""
            />
            <p>
              Lorem ipsum dolor, sit amet consectetur adipisicing elit. Possimus
              et, ex eum rem mollitia totam eius ad, sapiente eos maiores
              voluptatum, explicabo harum quos dolores nemo eaque reprehenderit
              quo. Iure.
            </p>
            <Link className="float-end" href="/booking">
              <Button className="bg-green-700 hover:bg-green-600 text-white my-5">
                Book Now
              </Button>
            </Link>
          </Box>
          <Box className={"p-1"}>
            <img
              src="https://picsum.photos/id/66/350/300"
              className="mb-3 min-w-full"
              alt=""
            />
            <p>
              Lorem ipsum dolor, sit amet consectetur adipisicing elit. Possimus
              et, ex eum rem mollitia totam eius ad, sapiente eos maiores
              voluptatum, explicabo harum quos dolores nemo eaque reprehenderit
              quo. Iure.
            </p>
            <Link className="float-end" href="/booking">
              <Button className="bg-green-700 hover:bg-green-600 text-white my-5">
                Book Now
              </Button>
            </Link>
          </Box>
          <Box className={"p-1"}>
            <img
              src="https://picsum.photos/id/67/350/300"
              className="mb-3 min-w-full"
              alt=""
            />
            <p>
              Lorem ipsum dolor, sit amet consectetur adipisicing elit. Possimus
              et, ex eum rem mollitia totam eius ad, sapiente eos maiores
              voluptatum, explicabo harum quos dolores nemo eaque reprehenderit
              quo. Iure.
            </p>
            <Link className="float-end" href="/booking">
              <Button className="bg-green-700 hover:bg-green-600 text-white my-5">
                Book Now
              </Button>
            </Link>
          </Box>
        </Row>
      </Page>
    </>
  );
};

export default HomePageContent;
