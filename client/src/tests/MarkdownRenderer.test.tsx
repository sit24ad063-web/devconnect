import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import MarkdownRenderer from "../components/MarkdownRenderer";

describe("MarkdownRenderer", () => {
  it("renders headings and bold text from Markdown source", () => {
    render(<MarkdownRenderer content={"## Hello\n\nThis is **bold** text."} />);
    expect(screen.getByRole("heading", { level: 2, name: "Hello" })).toBeInTheDocument();
    expect(screen.getByText("bold")).toBeInTheDocument();
  });

  it("renders a fenced code block", () => {
    render(<MarkdownRenderer content={"```js\nconsole.log('hi');\n```"} />);
    expect(screen.getByText(/console/)).toBeInTheDocument();
  });
});
