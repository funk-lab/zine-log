import { describe, expect, it } from "vitest";

import { editorReducer, initialEditorState } from "@/features/editor/editor-reducer";

describe("editorReducer", () => {
  it("appends uploaded images and advances nextImageId", () => {
    const nextState = editorReducer(initialEditorState, {
      type: "append-images",
      images: [
        { id: 1, src: "a", name: "a.jpg", selected: true },
        { id: 2, src: "b", name: "b.jpg", selected: true },
      ],
    });

    expect(nextState.images).toHaveLength(2);
    expect(nextState.nextImageId).toBe(3);
  });

  it("fills the example content without disturbing image library state", () => {
    const seeded = editorReducer(initialEditorState, {
      type: "append-images",
      images: [{ id: 1, src: "a", name: "a.jpg", selected: true }],
    });

    const nextState = editorReducer(seeded, { type: "fill-example" });

    expect(nextState.title).toContain("春日河岸慢走");
    expect(nextState.images).toHaveLength(1);
    expect(nextState.template).toBe("l-shape");
  });
});
