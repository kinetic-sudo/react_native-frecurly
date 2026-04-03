export const formatStatusLabel = (value?: string): string => {
  if (!value) return "unknow status";
  return value.charAt(0).toUpperCase() + value.slice(1);
};
