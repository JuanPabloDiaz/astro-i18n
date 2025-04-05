import { format } from "date-fns";

const dateFormat = (
  date: Date | string | undefined,
  pattern: string = "dd MMM, yyyy",
): string => {
  // Return a placeholder if date is undefined or null
  if (!date) {
    return "No date";
  }

  try {
    const dateObj = new Date(date);
    
    // Check if date is valid before formatting
    if (isNaN(dateObj.getTime())) {
      return "Invalid date";
    }
    
    return format(dateObj, pattern);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
};

export default dateFormat;
