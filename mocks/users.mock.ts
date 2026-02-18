import { defineMocks } from "../packages/schema/src/defineMock";

export default defineMocks([
  {
    enabled: true,
    match: {
      method: "GET",
      path: "/users/:id",
    },
    error: () => ({
      status: 500,
      body: {
        errorMessage: "error message",
      },
    }),
    response: ({ arrayFrom, faker, params, randomBool, uuid }) => ({
      status: 200,
      body: {
        sucess: true,
        code: 200,
        message: `${params.id} test`,
        data: {
          id: uuid(),
          users: arrayFrom(5, () => ({
            id: uuid(),
            name: faker.person.fullName(),
            gender: faker.person.gender(),
            zodicSign: faker.person.zodiacSign(),
            enabled: randomBool(),
          })),
        },
      },
    }),
  },
]);
