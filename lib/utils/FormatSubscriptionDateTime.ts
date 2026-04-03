import dayjs from "dayjs";

export const formatSubscriptionDateTime = (value?: string): string => {
  if (!value) return "not provided";
  const prasedDate = dayjs(value);
  return prasedDate.isValid() ? prasedDate.format("MM/DD") : "Not provided";
};
