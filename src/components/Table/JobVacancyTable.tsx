"use client";

import { Anchor, Badge, Group, Paper, Rating, Space, Title } from "@mantine/core";
import { MantineReactTable, type MRT_ColumnDef } from "mantine-react-table";
import { useMemo } from "react";
import { User } from "@/types/user";
import { JobVacancy } from "@prisma/client";
import { formatCurrencyInIDR } from "@/utils/utils";

export function JobVacancyTable({ data, deleteJob, editJob, viewJob }: { data: Array<JobVacancy>, deleteJob: (id: number) => void, viewJob: (id: number) => void, editJob: (id: number) => void }) {
    const columns = useMemo<MRT_ColumnDef<JobVacancy>[]>(
        () => [
            {
                accessorKey: "title",
                header: "Job Title",
            },
            {
                accessorKey: "postedBy.name",
                header: "Company",
            },
            {
                accessorKey: "workType",
                header: "Work Type",
                Cell: ({ cell }) => {
                    const status = cell.getValue<"freelance" | "fulltime" | "parttime" | "internship">();
                    let color: "red" | "yellow" | "green" | "blue" = "red";
                    if (status === "freelance") color = "green";
                    else if (status === "fulltime") color = "yellow";
                    else if (status === "parttime") color = "blue";
                    return <Badge color={color}>{status}</Badge>;
                },
                filterVariant: "select",
                mantineFilterSelectProps: {
                    data: [
                        { label: "Admin", value: "admin" },
                        { label: "Consultant", value: "consultant" },
                        { label: "Company", value: "company" },
                        { label: "User", value: "user" },
                    ] as any,
                },
            },
            {
                accessorKey: "location",
                header: "Location",
            },
            {
                accessorKey: "salary",
                header: "Salary",
                Cell: ({cell, row}) => {
                    return <Group>{row.original.salary ? `${formatCurrencyInIDR(row.original.salary)}/mo` : "Undisclosed"}</Group>
                }
            },
            {
                accessorKey: "action",
                header: "Action",
                Cell: ({ cell, row }) => {
                    return <Group>
                        <Anchor onClick={() => viewJob(row.original.id)} underline="never">
                            View
                        </Anchor>
                        <Anchor onClick={() => editJob(row.original.id)} underline="never">
                            Edit
                        </Anchor>
                        <Anchor onClick={() => deleteJob(row.original.id)} underline="never">
                            Delete
                        </Anchor>
                    </Group>
                },
            },
        ],
        [],
    );

    return (
        <Paper withBorder radius="md" p="md">
            <Title order={5}>Job Vacancy Data</Title>
            <Space h="md" />
            <MantineReactTable
                columns={columns}
                data={data}
                mantinePaperProps={{ shadow: "0", withBorder: false }}
            />
        </Paper>
    );
}
