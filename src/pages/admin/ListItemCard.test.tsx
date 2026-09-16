import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ListItemCard, type ListItemCardField } from "./ListItemCard";

// One field set reused across tests so each test only varies the
// interaction being verified, not the fixture.
const nameField: ListItemCardField = {
  key: "name",
  label: "Name",
  initialValue: "Jane Doe",
};

function renderCard(overrides: Partial<React.ComponentProps<typeof ListItemCard>> = {}) {
  // Resolve mocks BEFORE spreading overrides, so the object this
  // function returns always points at whichever mock actually got
  // wired into the rendered component — a caller-supplied onSave
  // override silently shadowing the returned reference is an easy,
  // hard-to-notice bug in a test helper (it was here on first draft).
  const onSave = overrides.onSave ?? vi.fn();
  const onDelete = overrides.onDelete ?? vi.fn();
  render(
    <ListItemCard
      title="Jane Doe"
      leadingVisual={{ kind: "photo", alt: "Photo for Jane Doe" }}
      fields={[nameField]}
      deleteLabel="Delete Jane Doe"
      editLabel="Edit Jane Doe"
      {...overrides}
      onSave={onSave}
      onDelete={onDelete}
    />
  );
  return { onSave, onDelete };
}

describe("ListItemCard — tri-state behavior (P3.5)", () => {
  it("starts in normal mode: shows the title and both triggers, no form fields", () => {
    renderCard();
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit Jane Doe" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete Jane Doe" })).toBeInTheDocument();
    expect(screen.queryByLabelText("Name")).not.toBeInTheDocument();
  });

  it("normal -> editing: clicking Edit reveals the form pre-filled with initialValue", async () => {
    const user = userEvent.setup();
    renderCard();

    await user.click(screen.getByRole("button", { name: "Edit Jane Doe" }));

    expect(screen.getByLabelText("Name")).toHaveValue("Jane Doe");
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  it("editing -> normal via Cancel: does NOT call onSave and discards the edit", async () => {
    const user = userEvent.setup();
    const { onSave } = renderCard();

    await user.click(screen.getByRole("button", { name: "Edit Jane Doe" }));
    await user.clear(screen.getByLabelText("Name"));
    await user.type(screen.getByLabelText("Name"), "Overwritten");
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onSave).not.toHaveBeenCalled();
    // Back to normal mode: form is gone, original title still shown.
    expect(screen.queryByLabelText("Name")).not.toBeInTheDocument();
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
  });

  it("editing -> normal via Save: calls onSave with the buffered values and closes the form", async () => {
    const user = userEvent.setup();
    // Explicit resolved-undefined return — that's the "save succeeded"
    // contract (see ListItemCardSaveResult's docstring in ListItemCard.tsx).
    const { onSave } = renderCard({ onSave: vi.fn().mockResolvedValue(undefined) });
    await user.click(screen.getByRole("button", { name: "Edit Jane Doe" }));
    await user.clear(screen.getByLabelText("Name"));
    await user.type(screen.getByLabelText("Name"), "Jane Smith");
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(onSave).toHaveBeenCalledWith({ name: "Jane Smith" }));
    expect(screen.queryByLabelText("Name")).not.toBeInTheDocument();
  });

  it("Save stays in editing when onSave returns fieldErrors (validation failure)", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue({ fieldErrors: { name: "Name is required" } });
    render(
      <ListItemCard
        title="Jane Doe"
        leadingVisual={{ kind: "photo", alt: "Photo for Jane Doe" }}
        fields={[nameField]}
        onSave={onSave}
        onDelete={vi.fn()}
        deleteLabel="Delete Jane Doe"
        editLabel="Edit Jane Doe"
      />
    );

    await user.click(screen.getByRole("button", { name: "Edit Jane Doe" }));
    await user.click(screen.getByRole("button", { name: "Save" }));

    // Still editing — the field and its error are visible, values weren't discarded.
    await waitFor(() => expect(screen.getByText("Name is required")).toBeInTheDocument());
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
  });

  it("normal -> confirming-delete: clicking Delete shows the inline confirm/cancel, not the form", async () => {
    const user = userEvent.setup();
    renderCard();

    await user.click(screen.getByRole("button", { name: "Delete Jane Doe" }));

    expect(screen.getByRole("button", { name: "Confirm" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    expect(screen.queryByLabelText("Name")).not.toBeInTheDocument();
  });

  it("confirming-delete -> normal via Cancel: does NOT call onDelete", async () => {
    const user = userEvent.setup();
    const { onDelete } = renderCard();

    await user.click(screen.getByRole("button", { name: "Delete Jane Doe" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onDelete).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Delete Jane Doe" })).toBeInTheDocument();
  });

  it("confirming-delete -> normal via Confirm: calls onDelete exactly once", async () => {
    const user = userEvent.setup();
    const { onDelete } = renderCard();

    await user.click(screen.getByRole("button", { name: "Delete Jane Doe" }));
    await user.click(screen.getByRole("button", { name: "Confirm" }));

    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it("editDisabled hides the Edit trigger entirely (archived-year / RLS-blocked state)", () => {
    renderCard({ editDisabled: true });
    expect(screen.queryByRole("button", { name: "Edit Jane Doe" })).not.toBeInTheDocument();
    // Delete trigger is a separate prop (deleteDisabled) — editDisabled alone must not touch it.
    expect(screen.getByRole("button", { name: "Delete Jane Doe" })).toBeEnabled();
  });

  it("deleteDisabled disables (not hides) the Delete trigger", () => {
    renderCard({ deleteDisabled: true });
    expect(screen.getByRole("button", { name: "Delete Jane Doe" })).toBeDisabled();
  });
});