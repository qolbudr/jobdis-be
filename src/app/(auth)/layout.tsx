import { Anchor, Box, Text, Title } from "@mantine/core";
import classes from "./layout.module.css";

interface Props {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: Props) {
  return (
    <Box className={classes.wrapper}>
      <Title order={1} fw="bolder">
        JOBDIS
      </Title>
      <Text c="dimmed" size="sm" mt={5}>
        Silahkan login menggunakan akun anda
      </Text>
      <Box w={400}>{children}</Box>
    </Box>
  );
}
