"use client";

import { Anchor, Badge, Group, Paper, Rating, Space, Title } from "@mantine/core";
import { MantineReactTable, type MRT_ColumnDef } from "mantine-react-table";
import { useMemo } from "react";
import { User } from "@/types/user";
import { JobVacancy } from "@prisma/client";

export function JobVacancyTable({ data, deleteJob, editJob }: { data: Array<JobVacancy>, deleteJob: (id: number) => void, editJob: (id: number) => void }) {
    const columns = useMemo<MRT_ColumnDef<JobVacancy>[]>(
        () => [
            {
                accessorKey: "title",
                header: "Job Title",
            },
            {
                accessorKey: "excerpt",
                header: "Description",
            },
            {
                accessorKey: "location",
                header: "Location",
            },
            {
                accessorKey: "postedBy",
                header: "Company",
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
