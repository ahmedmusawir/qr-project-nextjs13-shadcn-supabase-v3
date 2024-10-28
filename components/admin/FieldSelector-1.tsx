import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGHLDataStore } from "@/store/useGHLDataStore";

interface FieldSelectorProps {
  onFieldSelect: (fieldId: string, fieldName: string) => void;
}

const FieldSelector = ({ onFieldSelect }: FieldSelectorProps) => {
  const { fields } = useGHLDataStore();

  return (
    <Select
      onValueChange={(value) => {
        const selectedField = fields.find((field) => field.field_id === value);
        if (selectedField) {
          onFieldSelect(selectedField.field_id, selectedField.field_name);
        }
      }}
    >
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
