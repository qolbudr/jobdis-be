"use client";

import { useGlobal } from "@/context/global";
import { Exception } from "@/types/exception";
import {
  Anchor,
  Button,
  Card,
  Checkbox,
  Group,
  PasswordInput,
  TextInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useState } from "react";

export function LoginForm() {
  const auth = useGlobal();

  type State = {
    email?: string,
    password?: string,
  };

  const [state, setState] = useState<State>();
  const router = useRouter();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name;
    const value = e.target.value;

    setState({
      ...state,
      [name]: value
    })
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      await auth?.login({ email: state?.email ?? '', password: state?.password ?? '' });
      
      if (auth?.user?.role == "admin") router.replace('/dashboard/user');
      if (auth?.user?.role == "consultant") router.replace('/dashboard/session');
      if (auth?.user?.role == "company") router.replace('/dashboard/job');
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

  return (
    <Card withBorder shadow="md" p={30} mt={30} radius="md">
      <form onSubmit={(e) => handleSubmit(e)}>
        <TextInput label="Email" name="email" type="email" onChange={handleChange} placeholder="test@example.com" required />
        <PasswordInput
          name="password" onChange={handleChange}
          label="Password"
          placeholder="Your password"
          required
          mt="md"
        />
        {/* <Group mt="md" justify="space-between">
        <Checkbox label="Remember me" />
        <Anchor size="sm" href="#">
          Forgot Password？
        </Anchor>
      </Group> */}
        <Button type="submit" fullWidth mt="xl">
          Sign In
        </Button>
      </form>
    </Card>
  );
}
