"use client"

import { size } from "@/app/twitter-image";
import { LoaderPage } from "@/components/Loader/LoaderPage";
import { PageContainer } from "@/components/PageContainer/PageContainer";
import { JobVacancyTable } from "@/components/Table/JobVacancyTable";
import { Exception } from "@/types/exception";
import { ApiMethod, apiV1 } from "@/utils/api";
import { formatCurrencyInIDR } from "@/utils/utils";
import { Anchor, Breadcrumbs, Text, Grid, GridCol, Group, Paper, Title, Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { JobVacancy } from "@prisma/client";
import { IconBuilding, IconClock, IconCurrencyDollar, IconMap, IconMapPinExclamation } from "@tabler/icons-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const JobPageView = () => {
    const params: { id: string } = useParams();
    const [job, setJob] = useState<any>();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getData();
    }, [])

    const getData = async () => {
        try {
            const data = await apiV1({ method: ApiMethod.GET, path: '/api/job/' + params.id });
            setJob(data);
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

    return <>
        {loading ? <LoaderPage /> :
            <PageContainer title="Job Vacancy">
                <Grid>
                    <GridCol className="text-lefe" span={12}>
                        <Breadcrumbs>
                            <Anchor href="/dashboard">
                                Dashboard
                            </Anchor>
                            <Anchor href="/dashboard/job">
                                Job
                            </Anchor>
                            <Anchor href={`/dashboard/job/view/${params.id}`}>
                                View
                            </Anchor>
                        </Breadcrumbs>
                    </GridCol>
                    <GridCol span={12}>
                        <Paper withBorder radius="md" p="md">
                            <Title order={3}>{job?.title}</Title>
                            <Text mb={"md"} color={'gray'} size={"md"}>{job?.postedBy?.name}</Text>
                            <Group mb={"xs"}>
                                <IconMapPinExclamation size={20} />
                                <Text>{job?.location}</Text>
                            </Group>
                            {
                                job.division ?
                                    <Group mb={"xs"}>
                                        <IconBuilding size={20} />
                                        <Text>{job?.division}</Text>
                                    </Group> : <></>
                            }
                            <Group mb={"xs"}>
                                <IconClock size={20} />
                                <Text>{job?.workType}</Text>
                            </Group>
                            <Group mb={"xs"}>
                                <IconCurrencyDollar size={20} />
                                <Text>{job?.salary ? formatCurrencyInIDR(job.salary) : 'Undisclosed'}</Text>
                            </Group>
                            <Group mb="xs">
                                <Text color="grey"> {'Posted at ' + job?.createdAt}</Text>
                            </Group>
                            <Group mb="sm">
                                <Button component={Link} href={job.link} target="_blank" size="md">Apply Job</Button>
                            </Group>
                            <Paper dangerouslySetInnerHTML={{ __html: job.description }} />
                        </Paper>
                    </GridCol>
                </Grid>
            </PageContainer >
        }
    </>
}

export default JobPageView;