import { slugify } from "../src/utils/slugify";

describe("slugify", () => {
  it("lowercases and hyphenates a title", () => {
    expect(slugify("Why I Switched from REST to GraphQL")).toBe(
      "why-i-switched-from-rest-to-graphql"
    );
  });

  it("strips punctuation", () => {
    expect(slugify("Hello, World! It's a Test.")).toBe("hello-world-its-a-test");
  });

  it("collapses repeated whitespace/hyphens", () => {
    expect(slugify("  multiple   spaces -- here  ")).toBe("multiple-spaces-here");
  });
});
