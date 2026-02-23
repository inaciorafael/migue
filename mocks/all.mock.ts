import { defineMocks } from "../packages/schema/src/defineMock";

export default defineMocks([
  {
    enabled: true,
    triggerError: false,
    match: {
      method: "GET",
      path: "/users/:id",
    },
    error: ({ params }) => ({
      status: 500,
      body: {
        errorMessage: `Erro na chamada do usuario: ${params.id}`,
      },
    }),
    response: ({
      arrayFrom,
      faker,
      params,
      randomBool,
      uuid,
      randomInt,
      setState,
      getState,
    }) => ({
      status: 200,
      body: {
        sucess: true,
        code: 200,
        message: `user id: ${params.id}`,
        data: {
          id: setState("id", uuid()),
          users: arrayFrom(3, () => ({
            id: uuid(),
            ownerId: getState("id"),
            name: faker.person.fullName(),
            age: randomInt(18, 70),
            zodicSign: faker.person.zodiacSign(),
            enabled: randomBool(),
          })),
        },
      },
    }),
  },
]);
