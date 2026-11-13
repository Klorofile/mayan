import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./button";

describe("Button", () => {
  it("renders children and handles click", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save employee</Button>);

    await userEvent.click(screen.getByRole("button", { name: /save employee/i }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
