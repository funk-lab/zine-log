import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { App } from "@/app/App";

describe("App", () => {
  it("renders the React workspace shell", () => {
    render(<App />);

    expect(screen.getByText("Zine Log")).toBeInTheDocument();
    expect(screen.getByText("图库")).toBeInTheDocument();
    expect(screen.getByText("工具栏")).toBeInTheDocument();
    expect(screen.getByText("Editor Canvas")).toBeInTheDocument();
  });
});
