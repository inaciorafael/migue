import { defineMock } from "../packages/schema/src/defineMock";

export default defineMock({
  id: "get-user",
  enabled: true,
  triggerError: false,

  match: {
    method: "GET",
    path: "/users/:id",
    query: {
      page: 2,
    }
  },

  response: ({ arrayFrom, faker, params, query }) => ({
    delay: 10000,
    status: 200,
    body: {
      // id: params.id,
      page: query.page,
      items: arrayFrom(10, () => ({ name: faker.person.jobArea() })),
      title: "lorem",
    },
  }),
});
