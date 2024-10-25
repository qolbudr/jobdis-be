"use client";

import { useGlobal } from "@/context/global";
import {
  Anchor,
  Button,
  Card,
  Checkbox,
  Group,
  PasswordInput,
  TextInput,
} from "@mantine/core";
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
      router.replace('/dashboard');
    } catch (e) {
      console.log(e);
      // toast?.showToast({ text: e, type: ToastType.ERROR });
    }
  }

  return (
    <Card withBorder shadow="md" p={30} mt={30} radius="md">
      <form onSubmit={(e) => handleSubmit(e)}>
        <TextInput label="Email" name="email" onChange={handleChange} placeholder="test@example.com" required />
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
