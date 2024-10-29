"use client"

import { PageContainer } from "@/components/PageContainer/PageContainer";
import { Exception } from "@/types/exception";
import { Anchor, Breadcrumbs, Button, Grid, GridCol, Group, Paper, Space, Title, Text, TextInput, Textarea, Select, ComboboxItem } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";

import { useQuill } from 'react-quilljs';

import 'quill/dist/quill.snow.css';
import { JobVacancy } from "@prisma/client";
import { ApiMethod, apiV1 } from "@/utils/api";
import { useGlobal } from "@/context/global";

const JobPageAdd = () => {
    const router = useRouter();
    const global = useGlobal();
    const { quill, quillRef } = useQuill();
    const [data, setData] = useState({});
    const [description, setDescription] = useState('');
    const [workType, setWorkType] = useState('');

    useEffect(() => {
        if (quill) {
            quill.on('text-change', (delta, oldDelta, source) => {
                setDescription(quill.root.innerHTML);
            });
        }
    }, [quill])

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        try {
            e.preventDefault();
            await apiV1({ method: ApiMethod.POST, path: '/api/job', body: { ...data, description: description, workType: workType, userId: global?.user?.id } })
            router.replace('/dashboard/job?status=success')
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

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const name = e.target.name;
        const value = e.target.value;

        setData({
            ...data,
            [name]: value
        })
    }

    const handleWorkType = (value: string | null, option: ComboboxItem) => {
        setWorkType(value ?? 'fulltime')
    }

    return <>
        <PageContainer title="Add Job Vacancy">
            <Grid>
                <form onSubmit={handleSubmit}>
                    <GridCol className="text-left" span={12}>
                        <Breadcrumbs>
                            <Anchor href="/dashboard">
                                Dashboard
                            </Anchor>
                            <Anchor href="/dashboard/job">
                                Job
                            </Anchor>
                            <Anchor href="/dashboard/job/add">
                                Add
                            </Anchor>
                        </Breadcrumbs>
                    </GridCol>
                    <GridCol span={12}>
                        <Paper withBorder radius="md" p="md">
                            <Title order={5}>Job Vacancy Data</Title>
                            <Text<"span"> component="span" fw="regular" fz="sm">
                                Use this form to post your job vacancy
                            </Text>
                            <Space h="md" />
                            <Grid>
                                <GridCol span={12}>
                                    <TextInput
                                        onChange={handleChange}
                                        name="title"
                                        label="Job Title"
                                        placeholder="Frontend Developer"
                                        required
                                    />
                                </GridCol>
                                <GridCol span={12}>
                                    <Textarea
                                        onChange={handleChange}
                                        name="location"
                                        label="Location"
                                        rows={3}
                                        placeholder="23 Conch Street Ave 60231 TX, USA"
                                        required
                                    />
                                </GridCol>
                                <GridCol span={4}>
                                    <Select
                                        onChange={handleWorkType}
                                        name="workType"
                                        label="Work Type"
                                        placeholder="Pick value"
                                        data={['freelance', 'fulltime', 'parttime', 'internship']}
                                        required
                                    />
                                </GridCol>
                                <GridCol span={4}>
                                    <TextInput
                                        onChange={handleChange}
                                        name="division"
                                        label="Job Division"
                                        placeholder="Staff"
                                    />
                                </GridCol>
                                <GridCol span={4}>
                                    <TextInput
                                        onChange={handleChange}
                                        name="salary"
                                        label="Salary/mo"
                                        type="number"
                                        placeholder="80000000"
                                    />
                                </GridCol>
                                <GridCol span={12}>
                                    <Textarea
                                        onChange={handleChange}
                                        name="excerpt"
                                        label="Excerpt"
                                        rows={3}
                                        placeholder="Job as mechanical engineering in Maintenance Supervisor"
                                        required
                                    />
                                </GridCol>
                                <GridCol span={12}>
                                    <Text size={"sm"} fw={"bolder"}>Description<span style={{ "display": "inline" }} color={"red"}>*</span></Text>
                                    <div style={{ width: '100%', height: 150 }}>
                                        <div ref={quillRef} />
                                    </div>
                                </GridCol>
                                <GridCol mt={50} span={12}>
                                    <TextInput
                                        onChange={handleChange}
                                        name="link"
                                        label="Link"
                                        placeholder="https://id.jobstreet.com/job/79730277?type=standout&ref=search-standalone&origin=jobCard"
                                        required
                                    />
                                </GridCol>
                                <GridCol span={12}>
                                    <Group mt={"lg"} justify="flex-end">
                                        <Button variant="outline" onClick={() => router.back()} size="md">Cancel</Button>
                                        <Button type="submit" size="md">Save</Button>
                                    </Group>
                                </GridCol>
                            </Grid>
                        </Paper>
                    </GridCol>
                </form>
            </Grid>
        </PageContainer>
    </>
}

export default JobPageAdd;