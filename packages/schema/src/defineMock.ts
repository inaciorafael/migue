import { MockRule, MockRuleSchema } from "./mockRule.ts";

type ResponseFn = (ctx: any) => {
  status: number;
  delay?: number;
  body: any;
};

type AuthorMockRule = Omit<MockRule, "response"> & {
  response: MockRule["response"] | ResponseFn;
};

export function defineMock(rule: AuthorMockRule): MockRule {
  const parsed = MockRuleSchema.omit({ response: true }).parse(rule);

  return {
    ...parsed,
    response: rule.response as any,
  };
}

export function defineMocks(rules: AuthorMockRule[]): MockRule[] {
  return rules.map(defineMock);
}
