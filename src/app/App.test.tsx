import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { App } from "@/app/App";

describe("App", () => {
  it("renders the React workspace shell", () => {
    render(<App />);

    expect(screen.getByText("Zine Log")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "图库" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "工具栏" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "画布" })).toBeInTheDocument();
  });
});
