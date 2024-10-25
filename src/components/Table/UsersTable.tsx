"use client";

import { Badge, Paper, Rating, Space, Title } from "@mantine/core";
import { MantineReactTable, type MRT_ColumnDef } from "mantine-react-table";
import { useMemo } from "react";
import { User } from "@/types/user";

export function UsersTable( {data} : {data: Array<User>}) {
    const columns = useMemo<MRT_ColumnDef<User>[]>(
        () => [
            {
                accessorKey: "name",
                header: "Nama",
            },
            {
                accessorKey: "email",
                header: "Email",
            },
            {
                accessorKey: "role",
                header: "Role",
                Cell: ({ cell }) => {
                    const status = cell.getValue<"user" | "consultant" | "admin" | "company">();
                    let color: "red" | "yellow" | "green" | "blue" = "red";
                    if (status === "user") color = "green";
                    else if (status === "admin") color = "yellow";
                    else if (status === "consultant") color = "blue";
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
                accessorKey: "createdAt",
                header: "Register",
            },
        ],
        [],
    );

    return (
        <Paper withBorder radius="md" p="md">
            <Title order={5}>Users</Title>
            <Space h="md" />
            <MantineReactTable
                columns={columns}
                data={data}
                mantinePaperProps={{ shadow: "0", withBorder: false }}
            />
        </Paper>
    );
}
