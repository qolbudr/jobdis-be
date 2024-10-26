"use client"

import { PageContainer } from "@/components/PageContainer/PageContainer";
import { JobVacancyTable } from "@/components/Table/JobVacancyTable";
import { UsersTable } from "@/components/Table/UsersTable";
import { Exception } from "@/types/exception";
import { ApiMethod, apiV1 } from "@/utils/api";
import { Anchor, Breadcrumbs, Button, Grid, GridCol, Group, Modal, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { JobVacancy } from "@prisma/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const JobPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [data, setData] = useState<Array<JobVacancy>>([]);
    const [confirmDeleteOpen, openConfirmDelete] = useState(false);
    const [selectedId, setId] = useState<number | undefined>();

    useEffect(() => {
        getData();
        if(searchParams.get("status") == "success") {
            notifications.show({
                color: 'green',
                title: "Success",
                message: "Data has been successfully updated",
                position: 'top-center'
            })
        }
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

    const deleteJob = async () => {
        try {
            const user = await apiV1<JobVacancy>({ path: `/api/job/${selectedId}`, method: ApiMethod.DELETE });
            openConfirmDelete(false)
            getData();
            notifications.show({
                color: 'green',
                title: "Success",
                message: "Job vacancy has been deleted",
                position: 'top-center'
            })
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

    const actionDelete = (id: number) => {
        setId(id);
        openConfirmDelete(true)
    }

    const actionView = (id: number) => {
        setId(id);
        router.push('/dashboard/job/view/' + id);
    }

    const actionEdit = (id: number) => {
        setId(id);
        router.push('/dashboard/job/edit/' + id);
    }

    return <>
        <PageContainer title="Job Vacancy">
            <Modal opened={confirmDeleteOpen} onClose={() => openConfirmDelete(false)} title="Delete User" centered>
                <Text>Are you sure wanna delete this job vacancy?</Text>
                <Group mt="xl" justify="right">
                    <Button color="red" onClick={() => deleteJob()}>Delete</Button>
                    <Button variant="outline" onClick={() => openConfirmDelete(false)} type="submit">Cancel</Button>
                </Group>
            </Modal>

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
                    <JobVacancyTable data={data} viewJob={actionView} deleteJob={actionDelete} editJob={actionEdit} />
                </GridCol>
            </Grid>
        </PageContainer>
    </>
}

export default JobPage;