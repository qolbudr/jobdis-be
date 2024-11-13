'use client'

import { PageContainer } from "@/components/PageContainer/PageContainer";
import { UsersTable } from "@/components/Table/UsersTable";
import { Exception } from "@/types/exception";
import { User } from "@/types/user";
import { ApiMethod, apiV1 } from "@/utils/api";
import { Anchor, Breadcrumbs, Button, Card, ComboboxItem, Grid, GridCol, Group, Modal, PasswordInput, Select, Text, TextInput } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";

const UserPage = () => {
  const [data, setData] = useState<Array<User>>([]);
  const [userDetail, setUser] = useState<User | undefined>();
  const [selectedId, setId] = useState<string | undefined>();
  const [addModalOpen, openAddModal] = useState(false);
  const [confirmDeleteOpen, openConfirmDelete] = useState(false);
  const [editModalOpen, openEditModal] = useState(false);

  useEffect(() => {
    getData();
  }, [])

  const getData = async () => {
    try {
      const user = await apiV1<Array<User>>({ path: '/api/users', method: ApiMethod.GET });
      setData(user!);
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

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name;
    const value = e.target.value;

    setUser({ ...userDetail!, [name]: value })
  }

  const handleSelect = (value: string | null, option: ComboboxItem) => {
    setUser({ ...userDetail!, role: value ?? 'user' })
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      await apiV1<User>({ path: '/api/user', method: ApiMethod.POST, body: { ...userDetail, id: undefined } })
      openAddModal(false);
      getData();
      notifications.show({
        color: 'green',
        title: "Success",
        message: "User has been created",
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

  const handleSubmitEdit = async (e: FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      await apiV1<User>({ path: `/api/user/${selectedId}`, method: ApiMethod.POST, body: userDetail });
      openEditModal(false);
      getData();
      notifications.show({
        color: 'green',
        title: "Success",
        message: "User has been updated",
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

  const actionDelete = (id: string) => {
    setId(id);
    openConfirmDelete(true)
  }

  const deleteUser = async () => {
    try {
      const user = await apiV1<User>({ path: `/api/user/${selectedId}`, method: ApiMethod.DELETE });
      openConfirmDelete(false)
      getData();
      notifications.show({
        color: 'green',
        title: "Success",
        message: "User has been deleted",
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

  const actionEdit = async (id: string) => {
    try {
      setId(id);
      const user = await apiV1<User>({ method: ApiMethod.GET, path: `/api/user/${id}` });
      setUser(user);
      openEditModal(true)
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
    <PageContainer title="Users">
      <Modal opened={addModalOpen} onClose={() => openAddModal(false)} title="Add User" centered>
        <form onSubmit={handleSubmit}>
          <TextInput label="Name" name="name" type="text" onChange={handleChange} placeholder="Full Name" required />
          <TextInput mt="md" label="Email" name="email" type="email" onChange={handleChange} placeholder="test@example.com" required />
          <PasswordInput
            name="password" onChange={handleChange}
            label="Password"
            placeholder="Your password"
            required
            mt="md"
          />
          <Select
            onChange={handleSelect}
            mt="md"
            label="Role"
            placeholder="Pick value"
            data={['user', 'consultant', 'company', 'admin']}
          />
          <Button mt='xl' fullWidth={true} type="submit">Save</Button>
        </form>
      </Modal>

      <Modal opened={editModalOpen} onClose={() => openEditModal(false)} title="Edit User" centered>
        <form onSubmit={handleSubmitEdit}>
          <TextInput label="Name" value={userDetail?.name} name="name" type="text" onChange={handleChange} placeholder="Full Name" required />
          <TextInput mt="md" value={userDetail?.email} label="Email" name="email" type="email" onChange={handleChange} placeholder="test@example.com" required />
          <Select
            onChange={handleSelect}
            mt="md"
            value={userDetail?.role}
            label="Role"
            placeholder="Pick value"
            data={['user', 'consultant', 'company', 'admin']}
          />
          <Button mt='xl' fullWidth={true} type="submit">Save</Button>
        </form>
      </Modal>

      <Modal opened={confirmDeleteOpen} onClose={() => openConfirmDelete(false)} title="Delete User" centered>
        <Text>Are you sure wanna delete this user?</Text>
        <Group mt="xl" justify="right">
          <Button color="red" onClick={() => deleteUser()}>Delete</Button>
          <Button variant="outline" onClick={() => openConfirmDelete(false)} type="submit">Cancel</Button>
        </Group>
      </Modal>

      <Grid>
        <GridCol className="text-lefe" span={12}>
          <Breadcrumbs>
            <Anchor href="/dashboard">
              Dashboard
            </Anchor>
            <Anchor href="/dashboard/user">
              Users
            </Anchor>
          </Breadcrumbs>
        </GridCol>
        <GridCol className="text-right" span={12}>
          <Group>
            <Button onClick={() => openAddModal(true)}>Add User</Button>
          </Group>
        </GridCol>
        <GridCol span={12}>
          <UsersTable data={data} deleteUser={actionDelete} editUser={actionEdit} />
        </GridCol>
      </Grid>
    </PageContainer>

  </>
}

export default UserPage;