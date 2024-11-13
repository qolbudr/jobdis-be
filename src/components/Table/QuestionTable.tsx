"use client";

import { Anchor, Group, Paper, Text, Space, Title } from "@mantine/core";
import { MantineReactTable, type MRT_ColumnDef } from "mantine-react-table";
import { useMemo } from "react";
import { MappingQuestion } from "@prisma/client";
import { mbtiMapping } from "@/utils/utils";
import { JsonArray } from "@prisma/client/runtime/library";

export function QuestionTable({ data, deleteQuestion, editQuestion }: { data: Array<MappingQuestion>, deleteQuestion: (id: number) => void, editQuestion: (id: number) => void }) {
    const columns = useMemo<MRT_ColumnDef<MappingQuestion>[]>(
        () => [
            {
                accessorKey: "first",
                header: "Question A",
            },
            {
                accessorKey: "type.a",
                header: "Type A",
                Cell: ({ cell, row }) => {
                    const json = row.original?.category as JsonArray;
                    const key = json[0] as string;
                    return <Text>{mbtiMapping[key]}</Text>
                },
            },
            {
                accessorKey: "second",
                header: "Question B",
            },
            {
                accessorKey: "type.b",
                header: "Type B",
                Cell: ({ cell, row }) => {
                    const json = row.original?.category as JsonArray;
                    const key = json[1] as string;
                    return <Text>{mbtiMapping[key]}</Text>
                },
            },
            {
                accessorKey: "action",
                header: "Action",
                Cell: ({ cell, row }) => {
                    return <Group>
                        <Anchor onClick={() => editQuestion(row.original.id)} underline="never">
                            Edit
                        </Anchor>
                        <Anchor onClick={() => deleteQuestion(row.original.id)} underline="never">
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
            <Title order={5}>Question Data</Title>
            <Space h="md" />
            <MantineReactTable
                columns={columns}
                data={data}
                mantinePaperProps={{ shadow: "0", withBorder: false }}
            />
        </Paper>
    );
}
