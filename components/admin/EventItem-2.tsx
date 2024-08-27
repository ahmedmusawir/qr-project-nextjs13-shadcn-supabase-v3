import Link from "next/link";
import React, { useState } from "react";
import { Button } from "../ui/button";
import FieldSelector from "./FieldSelector";
import { GHLEvent } from "@/types/events";
import { formatDate } from "@/utils/common/commonUtils";

interface Props {
  event: GHLEvent;
}

const EventItem = ({ event }: Props) => {
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [selectedFieldName, setSelectedFieldName] = useState<string | null>(
    null
  );

  const handleFieldSelect = (fieldId: string, fieldName: string) => {
    setSelectedFieldId(fieldId);
    setSelectedFieldName(fieldName);
  };

  const handleSave = () => {
    if (selectedFieldId && selectedFieldName) {
      console.log("Product Name:", event.name);
      console.log("Product ID:", event._id);
      console.log("Selected Field Name:", selectedFieldName);
      console.log("Selected Field ID:", selectedFieldId);
      // This is where you would later handle the Supabase insertion
    } else {
      console.log("No field selected");
    }
  };

  return (
    <article className="bg-white relative isolate flex flex-col gap-8 lg:flex-col xl:flex-row mb-10 rounded-t-xl xl:pr-10 xl:rounded-2xl shadow-xl">
      <div className="relative aspect-[16/9] sm:aspect-[2/1] lg:aspect-[2/1] xl:w-1/2 xl:shrink-0 mt-[-32px]">
        <img
          alt=""
          src={event.image}
          className="h-[91%] w-full rounded-t-xl xl:rounded-l-2xl xl:rounded-r-none bg-gray-50 object-cover"
        />
      </div>
      <div className="text-center xl:text-left xl:w-1/2">
        <div className="flex items-center gap-x-4 text-xs mt-5 justify-center xl:justify-start">
          <time dateTime={event.createdAt} className="text-gray-500">
            {formatDate(event.createdAt)}
          </time>
        </div>
        <div className="group relative max-w-xl mx-auto xl:mx-0">
          <h2 className="font-semibold leading-6 text-gray-900 group-hover:text-gray-600 mt-[10px]">
            {event.name}
          </h2>
          <div className="flex justify-center xl:justify-start">
            <FieldSelector onFieldSelect={handleFieldSelect} />
          </div>
          <div className="flex border-t border-gray-900/5 pt-6 justify-center xl:justify-start">
            <p className="font-semibold text-gray-900">
              <Button
                className="bg-gray-700 hover:bg-gray-600 text-white w-[180px]"
                onClick={handleSave}
              >
                Save Custom Field
              </Button>
            </p>
          </div>
        </div>
        <div className="text-sm leading-6">
          <p className="font-semibold text-gray-900">
            <Link className="" href="/">
              <Button className="bg-indigo-700 hover:bg-gray-600 text-white w-full">
                View Orders
              </Button>
            </Link>
          </p>
        </div>
      </div>
    </article>
  );
};

export default EventItem;