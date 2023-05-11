import { useSession, signIn, signOut } from "next-auth/react";
import {
  Card,
  CardHeader,
  CardBody,
  Text,
  Button,
  Center,
} from "@chakra-ui/react";
import Dashboard from "@/components/Dashboard";

export default function Home() {
  const { data: session } = useSession();
  return (
    <Center>
      <Card align="center" textAlign="center">
        <CardHeader>
          {session ? (
            <Text>Signed in as {session.user?.email} </Text>
          ) : (
            <Text>Sign in to view data</Text>
          )}
        </CardHeader>
        <CardBody>
          {session ? (
            <>
              <Dashboard />
              <Button onClick={() => signOut()}>Sign out</Button>
            </>
          ) : (
            <Button onClick={() => signIn()}>Sign in</Button>
          )}
        </CardBody>
      </Card>
    </Center>
  );
}
