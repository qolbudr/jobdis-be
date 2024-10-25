'use client'

import { PageContainer } from "@/components/PageContainer/PageContainer";
import { UsersTable } from "@/components/Table/UsersTable";
import { Button, Card, Grid, GridCol, Group, Text } from "@mantine/core";
import { modals } from "@mantine/modals";

const UserPage = () => {
  const openDeleteModal = () =>
    modals.openConfirmModal({
      title: 'Add User',
      centered: true,
      children: (
        <Card>
          
        </Card>
      ),
      labels: { confirm: 'Save', cancel: "Cancel" },
      confirmProps: { color: 'green' },
      onCancel: () => console.log('Cancel'),
      onConfirm: () => console.log('Confirmed'),
    });

  return <>
    <PageContainer title="Users">
      <Grid>
        <GridCol className="text-right" span={12}>
          <Group>
            <Button onClick={() => openDeleteModal()}>Add User</Button>
          </Group>
        </GridCol>
        <GridCol span={12}>
          <UsersTable />
        </GridCol>
      </Grid>
    </PageContainer>

  </>
}

export default UserPage;