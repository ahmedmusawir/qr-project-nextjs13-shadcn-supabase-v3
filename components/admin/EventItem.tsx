import Link from "next/link";
import React from "react";
import { Button } from "../ui/button";
import FieldSelector from "./FieldSelector";
import { GHLEvent } from "@/types/events";
import { formatDate } from "@/utils/common/commonUtils";

interface Props {
  event: GHLEvent;
}
const EventItem = ({ event }: Props) => {
  return (
    <article
      key={event._id}
      className="relative isolate flex flex-col gap-8 lg:flex-row mb-10"
    >
      <div className="relative aspect-[16/9] sm:aspect-[2/1] lg:aspect-square lg:w-64 lg:shrink-0">
        <img
          alt=""
          src={event.image}
          className="absolute inset-0 h-full w-full rounded-2xl bg-gray-50 object-cover"
        />
      </div>
      <div>
        <div className="flex items-center gap-x-4 text-xs mt-5">
          <time dateTime="Nothing" className="text-gray-500">
            {formatDate(event.createdAt)}
          </time>
        </div>
        <div className="group relative max-w-xl">
          <h3 className="font-semibold leading-6 text-gray-900 group-hover:text-gray-600 mt-[10px]">
            {event.name}
          </h3>
          <FieldSelector />
        </div>
        <div className="mt-6 flex border-t border-gray-900/5 pt-6">
          <div className="relative flex items-center gap-x-4">
            <div className="text-sm leading-6">
              <p className="font-semibold text-gray-900">
                <Link className="float-end" href="/">
                  <Button className="bg-gray-700 hover:bg-gray-600 text-white">
                    Save Custom Field
                  </Button>
                </Link>
              </p>
            </div>
            <div className="text-sm leading-6">
              <p className="font-semibold text-gray-900">
                <Link className="float-end" href="/">
                  <Button className="bg-indigo-700 hover:bg-gray-600 text-white">
                    View Orders
                  </Button>
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default EventItem;
