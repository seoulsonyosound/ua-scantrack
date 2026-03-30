import { session } from "../session";


export function logout(navigation) {
  session.user = null;
  session.adminPasscode = null;

  navigation.reset({
    index: 0,
    routes: [{ name: "Login" }],
  });
}