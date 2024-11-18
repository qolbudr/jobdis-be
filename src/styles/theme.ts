"use client";

import { createTheme } from "@mantine/core";

export const theme = createTheme({
	fontFamily: "Inter, sans-serif",
	headings: {
		fontFamily: "Inter, sans-serif",
	},
	colors: {
		emerald: [
			"#f0fdf5",
			"#dcfce8",
			"#bbf7d1",
			"#86efad",
			"#4ade80",
			"#22c55e",
			"#5E6EE0",
			"#323d8f",
			"#166533",
			"#14532b",
			"#052e14",
		],
	},
	primaryColor: "emerald",
	defaultRadius: "md",
});
