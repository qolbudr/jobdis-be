'use client'

import { PageContainer } from "@/components/PageContainer/PageContainer";
import { PaymentChatTable } from "@/components/Table/PaymentChatTable";
import { Exception } from "@/types/exception";
import { ApiMethod, apiV1 } from "@/utils/api";
import { Anchor, Breadcrumbs, Button, Grid, GridCol, Group, Modal } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { PaymentChat } from "@prisma/client";
import { useEffect, useState } from "react";
import { Image } from "@mantine/core";

const UserPage = () => {
    const [data, setData] = useState<Array<PaymentChat>>([]);
    const [selectedData, setSelected] = useState<PaymentChat>();
    const [proofModalOpen, setProofModalOpen] = useState(false)

    useEffect(() => {
        getData();
    }, [])

    const getData = async () => {
        try {
            const payment = await apiV1<Array<PaymentChat>>({ path: '/api/payment/chats', method: ApiMethod.GET });
            setData(payment!);
        } catch (e) {
            const exception = e as Exception;
            notifications.show({
                color: 'red',
                title: exception.title,
                message: JSON.stringify(exception.error) ?? exception.message,
                position: 'top-center'
            })
        }
    }

    const viewPaymentProof = (rowData: PaymentChat) => {
        setSelected(rowData);
        setProofModalOpen(true);
    }

    const updatePayment = async (approve: boolean) => {
        try {
            if (approve) {
                await apiV1({ method: ApiMethod.GET, path: '/api/payment/chat/' + selectedData?.id, query: { code: 1 } })
                notifications.show({
                    color: 'green',
                    title: "Success",
                    message: "Payment has been accepted",
                    position: 'top-center'
                })
            } else {
                await apiV1({ method: ApiMethod.GET, path: '/api/payment/chat/' + selectedData?.id, query: { code: 0 } })
                notifications.show({
                    color: 'green',
                    title: "Success",
                    message: "Payment has been rejected",
                    position: 'top-center'
                })
            }

            setProofModalOpen(false);
            getData();
        } catch (e) {
            const exception = e as Exception;
            notifications.show({
                color: 'red',
                title: exception.title,
                message: JSON.stringify(exception.error) ?? exception.message,
                position: 'top-center'
            })
        }
    }

    return <>
        <PageContainer title="Payment Chat">
            <Modal opened={proofModalOpen} onClose={() => setProofModalOpen(false)} title="Payment Proof" centered>
                <Image src={selectedData?.paymentProof} width={'100%'}></Image>
                <Grid>
                    <GridCol span={6}>
                        <Button onClick={() => updatePayment(true)} mt='xl' fullWidth={true} type="submit">Approve</Button>
                    </GridCol>
                    <GridCol span={6}>
                        <Button onClick={() => updatePayment(false)} color="red" mt='xl' fullWidth={true} type="submit">Reject</Button>
                    </GridCol>
                </Grid>
            </Modal>
            <Grid>
                <GridCol className="text-left" span={12}>
                    <Breadcrumbs>
                        <Anchor href="/dashboard">
                            Dashboard
                        </Anchor>
                        <Anchor href="/dashboard/payment/chat">
                            Payment Chat
                        </Anchor>
                    </Breadcrumbs>
                </GridCol>
                <GridCol span={12}>
                    <PaymentChatTable openModalProof={viewPaymentProof} data={data} />
                </GridCol>
            </Grid>
        </PageContainer>

    </>
}

export default UserPage;