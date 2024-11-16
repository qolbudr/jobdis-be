"use client";

import { Anchor, Group, Paper, Space, Title } from "@mantine/core";
import { MantineReactTable, type MRT_ColumnDef } from "mantine-react-table";
import { useMemo } from "react";
import { InterestTest } from "@prisma/client";

export function InterestTable({ data, deleteData, editData }: { data: Array<InterestTest>, deleteData: (id: number) => void, editData: (id: number) => void }) {
    const columns = useMemo<MRT_ColumnDef<InterestTest>[]>(
        () => [
            {
                accessorKey: "statement",
                header: "Statement",
            },
            {
                accessorKey: "category",
                header: "Category",
            },
            {
                accessorKey: "action",
                header: "Action",
                Cell: ({ cell, row }) => {
                    return <Group>
                        <Anchor onClick={() => editData(row.original.id)} underline="never">
                            Edit
                        </Anchor>
                        <Anchor onClick={() => deleteData(row.original.id)} underline="never">
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
            <Title order={5}>Interest Question Data</Title>
            <Space h="md" />
            <MantineReactTable
                columns={columns}
                data={data}
                mantinePaperProps={{ shadow: "0", withBorder: false }}
            />
        </Paper>
    );
}
