/**
 * Converts a 24-hour time string (HH:MM or HH:MM:SS) to 12-hour format (HH:MM AM/PM)
 */
export const formatTime12H = (time24) => {
  if (!time24) return "";
  // If already in 12H format, return as is
  if (time24.toLowerCase().includes("am") || time24.toLowerCase().includes("pm")) {
    return time24;
  }

  try {
    let [hours, minutes] = time24.split(":");
    hours = parseInt(hours, 10);
    const modifier = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours.toString().padStart(2, "0")}:${minutes} ${modifier}`;
  } catch (e) {
    return time24;
  }
};

/**
 * Converts a 12-hour time string (HH:MM AM/PM) to 24-hour format (HH:MM:SS) for Django
 */
export const formatTime24H = (time12) => {
  if (!time12) return "";
  // If no space, assume it's already 24H
  if (!time12.includes(" ")) {
     if (time12.split(':').length === 2) return `${time12}:00`;
     return time12;
  }

  try {
    const [time, modifier] = time12.split(" ");
    let [hours, minutes] = time.split(":");
    if (hours === "12") {
      hours = modifier.toUpperCase() === "PM" ? "12" : "00";
    } else if (modifier.toUpperCase() === "PM") {
      hours = (parseInt(hours, 10) + 12).toString();
    }
    return `${hours.padStart(2, "0")}:${minutes}:00`;
  } catch (e) {
    return time12;
  }
};
