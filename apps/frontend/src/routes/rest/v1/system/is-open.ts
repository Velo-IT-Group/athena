import { createServerFileRoute } from "@tanstack/react-start/server";
import { getHoliday, getSchedule } from "@/lib/manage/read";

const daysOfTheWeek: Array<[string, string]> = [
	["sundayStartTime", "sundayEndTime"],
	["mondayStartTime", "mondayEndTime"],
	["tuesdayStartTime", "tuesdayEndTime"],
	["wednesdayStartTime", "wednesdayEndTime"],
	["thursdayStartTime", "thursdayEndTime"],
	["fridayStartTime", "fridayEndTime"],
	["saturdayStartTime", "saturdayEndTime"],
];

export const ServerRoute = createServerFileRoute(
	"/rest/v1/system/is-open",
).methods({
	GET: async () => {
		try {
			const date = new Date();
			const formattedDate: string = Intl.DateTimeFormat("en-US", {
				hour: "numeric",
				minute: "numeric",
				second: "numeric",
				hour12: false,
				timeZone: "America/Chicago",
			}).format(date);
			const dayOfTheWeek = daysOfTheWeek[date.getDay()];

			const schedule = await getSchedule({ data: {} });

			const holiday = await getHoliday({
				data: { id: schedule.holidayList.id },
			});

			if (holiday.length) {
				return Response.json({
					isOpen: false,
					closedReason: holiday[0].name,
				});
			}

			// @ts-ignore
			const startTime = schedule[dayOfTheWeek[0]] as string;
			// @ts-ignore
			const endTime = schedule[dayOfTheWeek[1]] as string;

			if (formattedDate > startTime && formattedDate < endTime) {
				return Response.json({ isOpen: true });
			}

			return Response.json({ isOpen: false });
		} catch (error) {
			console.error(error);
			return Response.json(
				{ error: "Internal Server Error", isOpen: false },
				{ status: 500 },
			);
		}
	},
});
