import { defineMock, defineMocks } from "../packages/schema/src/defineMock";

export default defineMocks([
  {
    enabled: true,

    match: {
      method: "GET",
      path: "/users/:id/:benefitId",
    },
    response: ({ arrayFrom, faker, params, query }) => ({
      delay: 10000,
      status: 200,
      body: {
        id: params.id,
        page: query.page,
        items: arrayFrom(10, () => ({ name: faker.person.jobArea() })),
        title: "lorem",
      },
    }),
  },
  {
    enabled: true,
    triggerError: false,

    match: {
      method: "GET",
      path: "/profile/:master",
    },
    response: ({ arrayFrom, faker, params, query }) => ({
      delay: 10000,
      status: 200,
      body: {
        items: arrayFrom(5, () => ({ name: faker.person.jobArea() })),
        params,
      },
    }),
  },
]);
