import { useEffect, useState } from "react";
import api from "src/libs/api";
import { User } from "src/libs/types";

export default function AdminView() {
  const [users, setUsers] = useState<User[] | null>(null);

  useEffect(() => {
    api.getUsers()
      .then(({ users }) => setUsers(users));
  }, []);

  if (!users) return "Loading...";

  return <div>
    {users.map(user => (
      <div key={user.id}>
        {user.email}
      </div>
    ))}
  </div>
}
