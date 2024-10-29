"use client"

import { size } from "@/app/twitter-image";
import { LoaderPage } from "@/components/Loader/LoaderPage";
import { PageContainer } from "@/components/PageContainer/PageContainer";
import { JobVacancyTable } from "@/components/Table/JobVacancyTable";
import { PaymentChatTableConsultant } from "@/components/Table/PaymentChatTableConsultant";
import { useGlobal } from "@/context/global";
import { Exception } from "@/types/exception";
import { ApiMethod, apiV1 } from "@/utils/api";
import { formatCurrencyInIDR } from "@/utils/utils";
import { Anchor, Breadcrumbs, Text, Grid, GridCol, Group, Paper, Title, Button, Input, TextInput, Select, ComboboxItem } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { ChatSession, JobVacancy, PaymentChat } from "@prisma/client";
import { IconBuilding, IconClock, IconCurrencyDollar, IconMap, IconMapPinExclamation } from "@tabler/icons-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";

const SessionPage = () => {
    const global = useGlobal();
    const [session, setSession] = useState<any>({});
    const [status, setStatus] = useState<string>();
    const [payment, setPayment] = useState<Array<PaymentChat>>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getData();
    }, [])

    const getData = async () => {
        try {
            const data = await apiV1<ChatSession>({ method: ApiMethod.GET, path: '/api/session' });
            setSession(data!);
            setStatus(data!.status);

            const paymentData = await apiV1<Array<PaymentChat>>({ method: ApiMethod.GET, path: '/api/payment/chats', query: { consultantId: global?.user?.id } })
            setPayment(paymentData!);
            setLoading(false);
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

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const name = e.target.name;
        const value = e.target.value;

        setSession({
            ...session,
            [name]: parseInt(value)
        })
    }

    const handleStatus = (value: string | null, option: ComboboxItem) => {
        setStatus(value!);
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        try {
            e.preventDefault();
            await apiV1({ method: ApiMethod.PATCH, path: '/api/session', body: { ...session, status: status } })
            notifications.show({
                color: 'green',
                title: "Success",
                message: "Data has been saved",
                position: 'top-center'
            })
        } catch (e) {
            const exception = e as Exception;
            notifications.show({
                color: 'red',
                title: exception.title,
                message: exception.message,
                position: 'top-center'
            })
        }
    }

    return <>
        {loading ? <LoaderPage /> :
            <PageContainer title="Chat Session">
                <Grid>
                    <GridCol className="text-lefe" span={12}>
                        <Breadcrumbs>
                            <Anchor href="/dashboard">
                                Dashboard
                            </Anchor>
                            <Anchor href="/dashboard/session">
                                Session
                            </Anchor>
                        </Breadcrumbs>
                    </GridCol>
                    <GridCol span={{ base: 12, lg: 3 }}>
                        <form onSubmit={handleSubmit}>
                            <Paper withBorder radius="md" p="md">
                                <Text size="lg" fw="bolder">Manage Session</Text>
                                <Text size="sm" mb="lg" color="grey">Manage your chat session as consultant ex: price and status</Text>
                                <TextInput onChange={handleChange} name="price" mb="sm" placeholder="0" type="number" label="Price" value={session.price} required></TextInput>
                                <Select
                                    onChange={handleStatus}
                                    name="status"
                                    value={status}
                                    label="Status"
                                    placeholder="Pick value"
                                    data={['online', 'busy', 'offline']}
                                    mb="xl"
                                    required
                                />
                                <Button type="submit" fullWidth={true}>Save</Button>
                            </Paper>
                        </form>
                    </GridCol>
                    <GridCol span={{ base: 12, lg: 9 }}>
                        <PaymentChatTableConsultant data={payment} />
                    </GridCol>
                </Grid>
            </PageContainer >
        }
    </>
}

export default SessionPage;