'use client'

import { PageContainer } from "@/components/PageContainer/PageContainer";
import { UsersTable } from "@/components/Table/UsersTable";
import { UserRepository } from "@/repository/auth/user_repository";
import { User } from "@/types/user";
import { ApiMethod, apiV1 } from "@/utils/api";
import { Button, Card, ComboboxItem, Grid, GridCol, Group, Modal, PasswordInput, Select, Text, TextInput } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";

const UserPage = () => {
  type State = {
    data: Array<User>
    user: {
      name?: string,
      email?: string,
      password?: string,
      role?: string
    }
  };

  const [state, setState] = useState<State>({ data: [], user: {} });
  const [openedAddModal, { open, close }] = useDisclosure(false);

  useEffect(() => {
    getData();
  }, [])

  const getData = async () => {
    try {
      const user = await apiV1<Array<User>>({ path: '/api/users', method: ApiMethod.GET });
      setState({ ...state, data: user ?? [] })
    } catch (e) {

    }
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name;
    const value = e.target.value;

    setState({
      ...state,
      user: { ...state.user, [name]: value }
    })
  }

  const handleSelect = (value: string | null, option: ComboboxItem) => {
    setState({
      ...state,
      user: { ...state.user, role: value ?? 'user' }
    })
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      await apiV1<User>({ path: '/api/user', method: ApiMethod.POST, body: state.user })
      close();
      getData();
    } catch (e) {
      console.log(e);
    }
  }
  return <>
    <PageContainer title="Users">
      <Modal opened={openedAddModal} onClose={close} title="Add User" centered>
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

      <Grid>
        <GridCol className="text-right" span={12}>
          <Group>
            <Button onClick={open}>Add User</Button>
          </Group>
        </GridCol>
        <GridCol span={12}>
          <UsersTable data={state.data} />
        </GridCol>
      </Grid>
    </PageContainer>

  </>
}

export default UserPage;