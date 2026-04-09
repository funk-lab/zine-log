import { describe, expect, it } from "vitest";

import { editorReducer, initialEditorState } from "@/features/editor/editor-reducer";

describe("editorReducer", () => {
  it("appends uploaded images to unselected zone and advances nextImageId", () => {
    const nextState = editorReducer(initialEditorState, {
      type: "append-images",
      images: [
        { src: "a", name: "a.jpg" },
        { src: "b", name: "b.jpg" },
      ],
    });

    expect(nextState.unselected).toHaveLength(2);
    expect(nextState.selected).toHaveLength(0);
    expect(nextState.nextImageId).toBe(3);
  });

  it("set-unselected directly replaces the unselected list", () => {
    const withImages = editorReducer(initialEditorState, {
      type: "append-images",
      images: [
        { src: "a", name: "a.jpg" },
        { src: "b", name: "b.jpg" },
      ],
    });

    // 模拟 PhotoGallery.onUnselectedChange 回调：移走第一张后只剩第二张
    const newUnselected = [withImages.unselected[1]];
    const nextState = editorReducer(withImages, {
      type: "set-unselected",
      images: newUnselected,
    });

    expect(nextState.unselected).toHaveLength(1);
    expect(nextState.unselected[0].id).toBe(withImages.unselected[1].id);
  });

  it("set-selected directly replaces the selected list", () => {
    const withImages = editorReducer(initialEditorState, {
      type: "append-images",
      images: [{ src: "a", name: "a.jpg" }],
    });

    const image = withImages.unselected[0];

    // 模拟 PhotoGallery.onSelectedChange 回调：将图片加入已选
    const nextState = editorReducer(withImages, {
      type: "set-selected",
      images: [image],
    });

    expect(nextState.selected).toHaveLength(1);
    expect(nextState.selected[0].id).toBe(image.id);
  });

  it("moves all unselected images to selected", () => {
    const withImages = editorReducer(initialEditorState, {
      type: "append-images",
      images: [
        { src: "a", name: "a.jpg" },
        { src: "b", name: "b.jpg" },
      ],
    });

    const nextState = editorReducer(withImages, { type: "move-all-to-selected" });

    expect(nextState.unselected).toHaveLength(0);
    expect(nextState.selected).toHaveLength(2);
  });

  it("clears selection by moving all selected back to unselected", () => {
    const withImages = editorReducer(initialEditorState, {
      type: "append-images",
      images: [{ src: "a", name: "a.jpg" }],
    });

    const selected = editorReducer(withImages, {
      type: "set-selected",
      images: [withImages.unselected[0]],
    });

    const nextState = editorReducer(selected, { type: "clear-selection" });

    expect(nextState.unselected).toHaveLength(1);
    expect(nextState.selected).toHaveLength(0);
  });

  it("fills the example content without disturbing image library state", () => {
    const seeded = editorReducer(initialEditorState, {
      type: "append-images",
      images: [{ src: "a", name: "a.jpg" }],
    });

    const nextState = editorReducer(seeded, { type: "fill-example" });

    expect(nextState.title).toContain("春日河岸慢走");
    expect(nextState.unselected).toHaveLength(1);
    expect(nextState.template).toBe("l-shape");
  });
});

