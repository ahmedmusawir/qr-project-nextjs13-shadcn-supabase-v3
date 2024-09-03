import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import FieldSelector from "./FieldSelector";
import { GHLEvent } from "@/types/events";
import { formatDate } from "@/utils/common/commonUtils";
import {
  getActiveFieldForProduct,
  upsertProductFieldCombo,
} from "@/services/fieldServices"; // Import the service function
import Spinner from "@/components/common/Spinner"; // Import Spinner component
import { Badge } from "../ui/badge";

interface Props {
  event: GHLEvent;
}

const EventItem = ({ event }: Props) => {
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [selectedFieldName, setSelectedFieldName] = useState<string | null>(
    null
  );
  const [activeFieldName, setActiveFieldName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetching current active filed from ghl_qr_fields table
  useEffect(() => {
    const fetchActiveField = async () => {
      const fieldName = await getActiveFieldForProduct(event._id);
      setActiveFieldName(fieldName);
    };

    fetchActiveField();
  }, [event._id]);

  // Updating selected values from the Event Selector
  const handleFieldSelect = (fieldId: string, fieldName: string) => {
    setSelectedFieldId(fieldId);
    setSelectedFieldName(fieldName);
  };

  // Connecting Product to Custom field in ghl_qr_fileds table
  const handleSave = async () => {
    if (selectedFieldId && selectedFieldName) {
      setIsLoading(true);
      setError(null);
      setMessage(null);

      try {
        const result = await upsertProductFieldCombo(
          event._id,
          event.name,
          selectedFieldId,
          selectedFieldName
        );

        // Updating current active filed name
        if (result.success) {
          setActiveFieldName(selectedFieldName);
        }

        setMessage("Field successfully linked to product.");
      } catch (err) {
        console.error(err);
        setError("Failed to link field to product.");
      } finally {
        setIsLoading(false);
      }
    } else {
      setError("No field selected Moose");
    }
  };

  return (
    <article className="bg-white relative isolate flex flex-col gap-8 lg:flex-col xl:flex-row mb-10 rounded-t-xl xl:pr-10 xl:rounded-2xl shadow-xl">
      <div className="relative aspect-[16/9] sm:aspect-[2/1] lg:aspect-[2/1] xl:w-1/2 xl:shrink-0 mt-[-32px]">
        <img
          alt=""
          src={event.image}
          className="h-[92%] w-full rounded-t-xl xl:rounded-l-2xl xl:rounded-r-none bg-gray-50 object-cover"
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
          <div className="text-sm mt-2 text-center xl:text-left">
            {!activeFieldName && <Spinner />}

            <section>
              <Badge variant="outline" className="bg-indigo-700 text-white">
                Connected Field:
              </Badge>{" "}
              <p
                className={
                  activeFieldName === "No active field connected"
                    ? "text-red-500 font-bold"
                    : "text-indigo-500 font-bold"
                }
              >
                {activeFieldName}
              </p>
            </section>
          </div>
          <div className="flex border-t border-gray-900/5 pt-6 justify-center xl:justify-start">
            <p className="font-semibold text-gray-900">
              <Button
                className="bg-indigo-700 hover:bg-gray-600 text-white w-[180px] flex items-center justify-center"
                onClick={handleSave}
                disabled={isLoading}
              >
                {isLoading ? <Spinner /> : "Save Custom Field"}
              </Button>
            </p>
          </div>
          {message && <p className="text-green-500 mt-2">{message}</p>}
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
        <div className="text-sm leading-6">
          <p className="font-semibold text-gray-900">
            <Link className="" href="/">
              <Button className="bg-gray-700 hover:bg-gray-600 text-white w-full">
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
