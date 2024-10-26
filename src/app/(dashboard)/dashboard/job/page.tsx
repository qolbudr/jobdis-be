"use client"

import { PageContainer } from "@/components/PageContainer/PageContainer";
import { JobVacancyTable } from "@/components/Table/JobVacancyTable";
import { UsersTable } from "@/components/Table/UsersTable";
import { Exception } from "@/types/exception";
import { ApiMethod, apiV1 } from "@/utils/api";
import { Anchor, Breadcrumbs, Button, Grid, GridCol, Group } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { JobVacancy } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const JobPage = () => {
    const router = useRouter();
    const [data, setData] = useState<Array<JobVacancy>>([]);

    useEffect(() => {
        getData();
    }, [])

    const getData = async () => {
        try {
            const jobs = await apiV1<Array<JobVacancy>>({ path: '/api/jobs', method: ApiMethod.GET });
            setData(jobs!);
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
                    </Breadcrumbs>
                </GridCol>
                <GridCol className="text-right" span={12}>
                    <Group>
                        <Button onClick={() => router.push('/dashboard/job/add')}>Add Job Vacancy</Button>
                    </Group>
                </GridCol>
                <GridCol span={12}>
                    <JobVacancyTable data={data} deleteJob={(e) => { }} editJob={(e) => { }} />
                </GridCol>
            </Grid>
        </PageContainer>
    </>
}

export default JobPage;