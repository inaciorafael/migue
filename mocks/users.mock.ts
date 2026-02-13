import { defineMocks } from "../packages/schema/src/defineMock";

export default defineMocks([
  {
    enabled: true,

    match: {
      method: "GET",
      path: "/bffstoreapi/purchases/:voucherId/voucher",
    },
    response: ({ arrayFrom, faker, params, query }) => ({
      delay: 10000,
      status: 200,
      body: {
        sucess: true,
        code: 200,
        message: "",
        data: {
          voucherCode: "1341241242332139",
          voucherPinCode: "1234",
          fileUrl:
            "https://file-vouchers-hml.familhao.com/d439e420-9c1e-4782-95a5-63a9ae98ce4e.pdf",
        },
      },
    }),
  },
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
