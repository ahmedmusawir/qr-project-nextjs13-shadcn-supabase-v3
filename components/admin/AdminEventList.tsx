import { useGHLDataStore } from "@/store/useGHLDataStore";
import Row from "../common/Row";
import EventItem from "./EventItem";
import Box from "../common/Box";

const AdminEventList = () => {
  const { events } = useGHLDataStore();

  return (
    // <Row className={"grid gap-3 grid-auto-fit p-3"}>
    <Row className="grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-2">
      {events.map((event) => (
        <EventItem event={event} />
      ))}
    </Row>
  );
};

export default AdminEventList;
