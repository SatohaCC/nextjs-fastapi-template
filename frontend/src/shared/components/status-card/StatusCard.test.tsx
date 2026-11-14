import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { StatusCard } from "./StatusCard";

describe("StatusCard", () => {
  it("renders status label, badge, and calls onAction on button press", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();

    render(
      <StatusCard
        label="Backend API"
        badgeText="ok"
        badgeTone="success"
        actionLabel="Refresh Status"
        onAction={onAction}
      />,
    );

    expect(screen.getByText("Backend API")).toBeInTheDocument();
    expect(screen.getByText("ok")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Refresh Status" }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
