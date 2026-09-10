export const DEMO_MODEL = "Qwen3.8-27B";

export const DEMO_PROMPT =
	"Plan a relaxed Lake District weekend for Maya's birthday. Check our family calendar, the dinner confirmation, saved places, and Friday's forecast. Keep driving under two hours, make an itinerary, and set a Thursday packing reminder. Do not book or message anyone without asking me.";

export const DEMO_STREAM =
	"I'll bring the private details together, resolve the timing and travel constraints, then leave every booking and message for your approval.";

export const DEMO_RESULT = `Your Lake District weekend is laid out without booking or messaging anyone.

Friday
- Leave after school pickup and check in before dinner at 19:30

Saturday
- Easy morning at Rydal Water
- Ambleside lunch, then the saved Grasmere walk if the weather holds
- 1h 42m total driving

Sunday
- Brunch near Keswick and home by 17:00

Ready for you
- Trips/lake-district-weekend.md has the full plan and wet-weather fallback
- Thursday 18:30 packing reminder is on
- Boat hire and the group message still need your approval`;

export const DEMO_DIFF = `diff --git a/Trips/lake-district-weekend.md b/Trips/lake-district-weekend.md
new file mode 100644
--- /dev/null
+++ b/Trips/lake-district-weekend.md
@@ -0,0 +1,12 @@
+# Maya's birthday weekend
+
+## Friday
+- Check in before the 19:30 dinner reservation
+
+## Saturday
+- Rydal Water, Ambleside, then Grasmere if dry
+- Total driving: 1h 42m
+
+## Sunday
+- Keswick brunch and home by 17:00
+
+No bookings or messages sent without approval
`;

export type DemoToolArgs =
	| { readonly kind: "path"; readonly path: string; readonly range?: string }
	| { readonly kind: "query"; readonly query: string }
	| { readonly kind: "stops"; readonly stops: readonly string[] }
	| { readonly kind: "schedule"; readonly schedule: string; readonly name: string };

export type DemoToolSpec = {
	readonly id: string;
	readonly name: string;
	readonly args: DemoToolArgs;
	readonly resultText: string;
};

export const DEMO_TOOLS: readonly DemoToolSpec[] = [
	{
		id: "calendar",
		name: "read_calendar",
		args: { kind: "path", path: "Family/calendar.ics", range: "Fri-Sun" },
		resultText: `Friday
15:20 School pickup
19:30 Birthday dinner at The Old Stamp House

Sunday
17:00 Be home for Alex's call`,
	},
	{
		id: "reservation",
		name: "read_email",
		args: { kind: "path", path: "Family/dinner-confirmation.eml" },
		resultText: `The Old Stamp House
Friday · 19:30 · 6 guests
Reservation confirmed · no prepayment due`,
	},
	{
		id: "saved-places",
		name: "read_file",
		args: { kind: "path", path: "Family/saved-places.md" },
		resultText: `Rydal Water
Grasmere gingerbread
Lingholm Kitchen
Keswick market`,
	},
	{
		id: "forecast",
		name: "search_web",
		args: { kind: "query", query: "Lake District Friday to Sunday forecast" },
		resultText: `Friday: light rain, clearing 18:00
Saturday: dry morning, showers after 16:00
Sunday: clear, 12°C`,
	},
	{
		id: "route",
		name: "plan_route",
		args: { kind: "stops", stops: ["Rydal Water", "Ambleside", "Grasmere"] },
		resultText: `Optimized Saturday route
Total driving: 1h 42m
Walking options stay under 90 minutes`,
	},
	{
		id: "itinerary",
		name: "write_file",
		args: { kind: "path", path: "Trips/lake-district-weekend.md" },
		resultText: `Created Trips/lake-district-weekend.md
3-day itinerary
Wet-weather fallback included
No booking actions taken`,
	},
	{
		id: "packing",
		name: "create_automation",
		args: { kind: "schedule", schedule: "Thursday 18:30", name: "Lake District packing reminder" },
		resultText: `Automation created
Thursday at 18:30
Rechecks the forecast before building the packing list
Messaging disabled`,
	},
];
