import {
  CalendarDateTime,
  DateFormatter,
  getLocalTimeZone,
} from "@internationalized/date";
import { useUserPreferences } from "./useUserPreferences";

export interface FormatOptions {
  dateStyle?: "full" | "long" | "medium" | "short";
  timeStyle?: "full" | "long" | "medium" | "short";
  locale?: string;
  hour12?: boolean;
  showTime?: boolean;
}

export const useFormat = () => {
  // Get current locale from i18n
  const { locale } = useI18n();
  
  // Get user preferences from localStorage
  const userPreferences =  computed(() => useUserPreferences().getPreferences() || DEFAULT_USER_PREFERENCES)
  
  // Default format options based on user preferences
  const defaultOptions = computed((): FormatOptions => ({
    dateStyle: userPreferences.value.dateFormat || "medium",
    timeStyle: userPreferences.value.timeFormat || "short",
    locale: locale.value || "en-GB",
    hour12: userPreferences.value.hour12 !== undefined ? userPreferences.value.hour12 : true,
    showTime: true,
  }));

  /**
   * Format a date string or Date object to a localized datetime string
   * @param dateInput - Date string, Date object, or null/undefined
   * @param options - Formatting options
   * @returns Formatted datetime string or fallback value
   */
  const formatDateTime = (
    dateInput: string | Date | null | undefined,
    options: FormatOptions = {}
  ): string => {
    // Handle null/undefined cases
    if (!dateInput) {
      return "-";
    }

    try {
      // Merge with default options from user preferences
      const mergedOptions = { ...defaultOptions.value, ...options };
      
      // Create Date object from input
      const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
      
      // Validate date
      if (isNaN(date.getTime())) {
        console.warn("Invalid date provided to formatDateTime:", dateInput);
        return typeof dateInput === "string" ? dateInput : "-";
      }

      // Create CalendarDateTime object
      const calendarDate = new CalendarDateTime(
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate(),
        date.getHours(),
        date.getMinutes(),
        date.getSeconds()
      );

      const dateObj = calendarDate.toDate(getLocalTimeZone());

      // If only date is needed (no time)
      if (!mergedOptions.showTime) {
        const formatter = new DateFormatter("en-GB", {
          dateStyle: mergedOptions.dateStyle,
        });
        return formatter.format(dateObj);
      }

      // Format date and time separately to avoid comma
      const dateFormatter = new DateFormatter("en-GB", {
        dateStyle: mergedOptions.dateStyle,
      });

      const timeFormatter = new DateFormatter("en-GB", {
        timeStyle: mergedOptions.timeStyle,
        hour12: userPreferences.value.hour12,
      });

      const formattedDate = dateFormatter.format(dateObj);
      const formattedTime = timeFormatter.format(dateObj);

      // Join with space instead of comma
      return `${formattedDate} ${formattedTime}`;
    } catch (error) {
      console.error("Error formatting datetime:", error, "Input:", dateInput);
      return typeof dateInput === "string" ? dateInput : "-";
    }
  };

  /**
   * Format a date string or Date object to a date-only string
   * @param dateInput - Date string, Date object, or null/undefined
   * @param options - Formatting options
   * @returns Formatted date string or fallback value
   */
  const formatDate = (
    dateInput: string | Date | null | undefined,
    options: Omit<FormatOptions, "timeStyle" | "showTime"> = {}
  ): string => {
    return formatDateTime(dateInput, { ...options, showTime: false });
  };

  /**
   * Format a date string or Date object to a time-only string
   * @param dateInput - Date string, Date object, or null/undefined
   * @param options - Formatting options
   * @returns Formatted time string or fallback value
   */
  const formatTime = (
    dateInput: string | Date | null | undefined,
    options: Pick<FormatOptions, "timeStyle" | "locale" | "hour12"> = {}
  ): string => {
    if (!dateInput) {
      return "-";
    }

    try {
      const mergedOptions = { ...defaultOptions.value, ...options };
      const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
      
      if (isNaN(date.getTime())) {
        return "-";
      }

      const formatter = new DateFormatter(mergedOptions.locale!, {
        timeStyle: mergedOptions.timeStyle || "short",
        hour12: mergedOptions.hour12,
        // timeZone: userPreferences.value.timezone,
      });

      const calendarDate = new CalendarDateTime(
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate(),
        date.getHours(),
        date.getMinutes(),
        date.getSeconds()
      );

      return formatter.format(calendarDate.toDate(getLocalTimeZone()));
    } catch (error) {
      console.error("Error formatting time:", error, "Input:", dateInput);
      return "-";
    }
  };

  /**
   * Get relative time string (e.g., "2 hours ago", "in 3 days")
   * @param dateInput - Date string, Date object, or null/undefined
   * @param options - Formatting options
   * @returns Relative time string or fallback value
   */
  const formatRelativeTime = (
    dateInput: string | Date | null | undefined,
    options: Pick<FormatOptions, "locale"> = {}
  ): string => {
    if (!dateInput) {
      return "-";
    }

    try {
      const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
      
      if (isNaN(date.getTime())) {
        return "-";
      }

      const now = new Date();
      const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);
      
      const rtf = new Intl.RelativeTimeFormat(options.locale || defaultOptions.value.locale, {
        numeric: "auto",
      });

      // Define time units in seconds
      const timeUnits = [
        { unit: "year", seconds: 31536000 },
        { unit: "month", seconds: 2628000 },
        { unit: "week", seconds: 604800 },
        { unit: "day", seconds: 86400 },
        { unit: "hour", seconds: 3600 },
        { unit: "minute", seconds: 60 },
        { unit: "second", seconds: 1 },
      ] as const;

      for (const { unit, seconds } of timeUnits) {
        const value = Math.floor(Math.abs(diffInSeconds) / seconds);
        if (value >= 1) {
          return rtf.format(diffInSeconds < 0 ? -value : value, unit);
        }
      }

      return rtf.format(0, "second");
    } catch (error) {
      console.error("Error formatting relative time:", error, "Input:", dateInput);
      return "-";
    }
  };

  return {
    formatDateTime,
    formatDate,
    formatTime,
    formatRelativeTime,
    userPreferences: readonly(userPreferences),
  };
};
