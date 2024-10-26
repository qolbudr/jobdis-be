"use client"

import { PageContainer } from "@/components/PageContainer/PageContainer";
import { JobVacancyTable } from "@/components/Table/JobVacancyTable";
import { UsersTable } from "@/components/Table/UsersTable";
import { Anchor, Breadcrumbs, Button, Grid, GridCol, Group } from "@mantine/core";

const JobPage = () => {
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
                        <Button>Add Job Vacancy</Button>
                    </Group>
                </GridCol>
                <GridCol span={12}>
                    <JobVacancyTable data={[]} deleteJob={(e) => { }} editJob={(e) => { }} />
                </GridCol>
            </Grid>
        </PageContainer>

    </>
}

export default JobPage;