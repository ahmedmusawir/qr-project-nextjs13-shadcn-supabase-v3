import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGHLDataStore } from "@/store/useGHLDataStore";

const FieldSelector = () => {
  const { fields } = useGHLDataStore();

  // console.log("The Custom Fields", fields);

  return (
    <Select>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select Custom Field" />
      </SelectTrigger>
      <SelectContent className="bg-white">
        <SelectGroup>
          {fields.map((field) => (
            <SelectItem key={field.field_id} value={field.field_id}>
              {field.field_name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default FieldSelector;
