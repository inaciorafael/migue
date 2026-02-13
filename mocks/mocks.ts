import { defineMock } from "../packages/schema/src/defineMock";

export default defineMock({
  id: "get-users",
  match: { method: "GET", path: "/users" },
  response: ({ faker, uuid }) => ({
    status: 200,
    body: {
      id: uuid(),
      name: faker.person.fullName(),
    },
  }),
});
