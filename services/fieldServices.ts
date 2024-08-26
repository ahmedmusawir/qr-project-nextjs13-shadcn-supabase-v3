export const fetchCustomFields = async () => {
  const response = await fetch("/api/qrapp/fields");
  if (!response.ok) {
    throw new Error("Failed to fetch custom fields");
  }
  const data = await response.json();
  return data.map((field: any) => ({
    field_id: field.id,
    field_name: field.name,
  }));
};
