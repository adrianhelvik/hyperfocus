import assertCanEditBoard from "./assertCanEditBoard";
import createSession from "./createSession";
import createBoard from "./createBoard";
import createUser from "./createUser";
import crypto from "crypto";

it("does not throw for an owner", async () => {
  const boardId = crypto.randomUUID();
  const userId = crypto.randomUUID();

  await createUser({
    email: "test@test.com",
    username: "test",
    password: "test",
    userId,
  });

  const sessionId = await createSession(userId);

  await createBoard({
    createdBy: userId,
    boardId,
    title: "A nice title",
  });

  const request = {
    headers: {
      authorization: `Bearer ${sessionId}`,
    },
  };

  await assertCanEditBoard(request, boardId);
});
