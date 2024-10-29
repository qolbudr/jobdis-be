"use client";

import { Anchor, Badge, Group, Paper, Space, Text, Title } from "@mantine/core";
import { MantineReactTable, type MRT_ColumnDef } from "mantine-react-table";
import { useMemo } from "react";
import { PaymentChat } from "@prisma/client";
import { formatCurrencyInIDR } from "@/utils/utils";

export function PaymentChatTable({ data, openModalProof }: { data: Array<PaymentChat>, openModalProof: (rowData: PaymentChat) => void }) {
    const columns = useMemo<MRT_ColumnDef<PaymentChat>[]>(
        () => [
            {
                accessorKey: "roomId",
                header: "Room Id",
            },
            {
                accessorKey: "user.name",
                header: "User",
            },
            {
                accessorKey: "session.consultant.name",
                header: "Consultant",
            },
            {
                accessorKey: "session.price",
                header: "Price",
                Cell: ({ cell, row, renderedCellValue }) => {
                    return <>
                        <Text>{formatCurrencyInIDR(renderedCellValue as number)}</Text>
                    </>
                },
            },
            {
                accessorKey: "paid",
                header: "Status",
                Cell: ({ cell, row }) => {
                    return <>
                        {row.original.paid ? <Badge color="green">Paid</Badge> : <Badge color="yellow">Pending</Badge>}
                    </>
                },
            },
            {
                accessorKey: "proof",
                header: "Proof",
                Cell: ({ cell, row }) => {
                    return <Group>
                        <Anchor onClick={() => openModalProof(row.original)} underline="never">
                            Payment Proof
                        </Anchor>
                    </Group>
                },
            }
        ],
        [],
    );

    return (
        <Paper withBorder radius="md" p="md">
            <Title order={5}>Payment Chat Data</Title>
            <Space h="md" />
            <MantineReactTable
                columns={columns}
                data={data}
                mantinePaperProps={{ shadow: "0", withBorder: false }}
            />
        </Paper>
    );
}
