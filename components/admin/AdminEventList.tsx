import { useGHLDataStore } from "@/store/useGHLDataStore";
import EventItem from "./EventItem";

const AdminEventList = () => {
  const { events } = useGHLDataStore();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2">
      {events.map((event) => (
        <EventItem key={event._id} event={event} />
      ))}
    </div>
  );
};

export default AdminEventList;
