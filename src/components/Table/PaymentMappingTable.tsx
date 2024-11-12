"use client";

import { Anchor, Badge, Group, Paper, Space, Text, Title } from "@mantine/core";
import { MantineReactTable, type MRT_ColumnDef } from "mantine-react-table";
import { useMemo } from "react";
import { PaymentMapping } from "@prisma/client";
import { formatCurrencyInIDR } from "@/utils/utils";

export function PaymentMappingTable({ data, openModalProof }: { data: Array<PaymentMapping>, openModalProof: (rowData: PaymentMapping) => void }) {
    const columns = useMemo<MRT_ColumnDef<PaymentMapping>[]>(
        () => [
            {
                accessorKey: "user.name",
                header: "User",
            },
            {
                accessorKey: "session.price",
                header: "Price",
                Cell: ({ cell, row, renderedCellValue }) => {
                    return <>
                        <Text>{formatCurrencyInIDR(50000)}</Text>
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
            <Title order={5}>Payment Mapping Data</Title>
            <Space h="md" />
            <MantineReactTable
                columns={columns}
                data={data}
                mantinePaperProps={{ shadow: "0", withBorder: false }}
            />
        </Paper>
    );
}
