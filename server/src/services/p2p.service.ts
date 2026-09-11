import dotenv from 'dotenv';

dotenv.config();

export interface CampusScheduleStatus {
  isHolidayOrWeekend: boolean;
  holidayName?: string;
  isClassDay: boolean;
  summary: string;
}

/**
 * Queries the official Nager.Date Public API to check if today is an official
 * holiday or active campus operational day in Thailand (TH).
 */
export const checkCampusScheduleStatus = async (): Promise<CampusScheduleStatus> => {
  const today = new Date();
  const year = today.getFullYear();
  const todayDateString = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  const dayOfWeek = today.getDay(); // 0 is Sunday, 6 is Saturday

  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  try {
    const url = `https://date.nager.at/api/v3/PublicHolidays/${year}/TH`;
    console.log(`🌐 [Public API] Querying official Thailand holidays from Nager.Date...`);

    const response = await fetch(url);

    if (!response.ok) {
      console.warn(`⚠️ Public Holiday API returned status ${response.status}`);
      return {
        isHolidayOrWeekend: isWeekend,
        isClassDay: !isWeekend,
        summary: isWeekend ? 'Weekend (Campus closed/reduced capacity)' : 'Standard Academic Day',
      };
    }

    const holidays = (await response.json()) as Array<{ date: string; localName: string; name: string }>;

    // Check if today matches any official holiday
    const matchedHoliday = holidays.find((h) => h.date === todayDateString);

    if (matchedHoliday) {
      console.log(`🎉 [Public API] Holiday detected: ${matchedHoliday.name}`);
      return {
        isHolidayOrWeekend: true,
        holidayName: matchedHoliday.name,
        isClassDay: false,
        summary: `Public Holiday: ${matchedHoliday.name} (${matchedHoliday.localName})`,
      };
    }

    if (isWeekend) {
      return {
        isHolidayOrWeekend: true,
        isClassDay: false,
        summary: 'Weekend (Campus administrative off-hours)',
      };
    }

    console.log(`✅ [Public API] Active academic day verified.`);
    return {
      isHolidayOrWeekend: false,
      isClassDay: true,
      summary: 'Active Academic Session (Classes in session)',
    };
  } catch (error) {
    console.error('❌ Failed to fetch from holiday API:', error);
    return {
      isHolidayOrWeekend: isWeekend,
      isClassDay: !isWeekend,
      summary: 'Normal schedule (Offline fallback)',
    };
  }
};

// Stub to keep existing imports intact
export const broadcastToGroup3 = (type: string, data: any) => {};