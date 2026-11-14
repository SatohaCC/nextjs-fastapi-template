import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  it("renders children and invokes onClick when pressed", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<Button onClick={onClick}>Refresh</Button>);

    const button = screen.getByRole("button", { name: "Refresh" });
    await user.click(button);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not invoke onClick when disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <Button disabled onClick={onClick}>
        Refresh
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Refresh" });
    expect(button).toBeDisabled();
    await user.click(button);

    expect(onClick).not.toHaveBeenCalled();
  });
});
