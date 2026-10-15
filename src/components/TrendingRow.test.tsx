import type { ComponentProps } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ContentItem } from "@/types/content";
import { TrendingRow } from "./TrendingRow";

function makeItem(overrides: Partial<ContentItem> = {}): ContentItem {
  return {
    id: 1,
    title: "Echoes of Orion",
    year: 2019,
    genre: ["Sci-Fi"],
    rating: 8,
    thumbnail: "/poster.png",
    video_url: "/video.mp4",
    duration: 45,
    description: "A test description.",
    cast: ["Actor One"],
    watchProgress: 0,
    ...overrides,
  };
}

type Props = ComponentProps<typeof TrendingRow>;

function renderRow(overrides: Partial<Props> = {}) {
  const props: Props = {
    status: "success",
    items: [makeItem()],
    history: {},
    onRetry: jest.fn(),
    onSelect: jest.fn(),
    ...overrides,
  };
  render(<TrendingRow {...props} />);
  return props;
}

describe("TrendingRow", () => {
  it("renders each title as a button", () => {
    renderRow({
      items: [makeItem(), makeItem({ id: 2, title: "The Salt Road" })],
    });

    expect(
      screen.getByRole("button", { name: "Echoes of Orion" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "The Salt Road" }),
    ).toBeInTheDocument();
  });

  it("calls onSelect with the clicked item", async () => {
    const user = userEvent.setup();
    const item = makeItem();
    const { onSelect } = renderRow({ items: [item] });

    await user.click(screen.getByRole("button", { name: "Echoes of Orion" }));

    expect(onSelect).toHaveBeenCalledWith(item);
  });

  // ---------- Edge cases ----------

  it("shows an error with a Retry button that calls onRetry", async () => {
    const user = userEvent.setup();
    const { onRetry } = renderRow({ status: "error", items: [] });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Failed to load trending titles.",
    );

    await user.click(screen.getByRole("button", { name: "Retry" }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("shows an empty message when there are no titles", () => {
    renderRow({ status: "success", items: [] });

    expect(
      screen.getByText("No trending titles available right now."),
    ).toBeInTheDocument();

    expect(screen.queryByRole("list")).toBeNull();
  });

  it("announces loading and hides the skeleton from screen readers", () => {
    renderRow({ status: "loading", items: [] });

    expect(screen.getByRole("status")).toHaveTextContent(
      "Loading trending titles...",
    );

    expect(screen.queryByRole("button")).toBeNull();
  });

  it("includes watch progress in the tile's accessible name", () => {
    renderRow({
      history: { 1: { progress: 40, updatedAt: 1 } },
    });

    expect(
      screen.getByRole("button", { name: /40% watched/ }),
    ).toBeInTheDocument();
  });
});
