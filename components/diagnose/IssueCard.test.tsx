import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { IssueCard } from "./IssueCard";
import { DemoBanner, DEMO_BANNER_TEXT } from "./DemoBanner";
import { getGuide } from "@/lib/guides";

describe("IssueCard", () => {
  it("shows category, title, confidence as text, evidence and the guide link", () => {
    render(
      <IssueCard
        index={0}
        issue={{
          category: "chain",
          title: "Worn chain",
          confidence: 0.824,
          evidence: "Chain skips under load on small cogs.",
          guideId: "chain-wear-check",
        }}
      />,
    );
    expect(screen.getByRole("heading", { name: "Worn chain" })).toBeInTheDocument();
    expect(screen.getByText("Chain")).toBeInTheDocument();
    expect(screen.getByText(/\(high\)/).parentElement).toHaveTextContent("82% (high)");
    expect(document.querySelector("meter")).toHaveAttribute("value", "82");
    expect(screen.getByText("Chain skips under load on small cogs.")).toBeInTheDocument();
    const link = screen.getByRole("link", { name: new RegExp(getGuide("chain-wear-check")!.title) });
    expect(link).toHaveAttribute("href", "/guides/chain-wear-check");
  });

  it("explains when there is no guide", () => {
    render(
      <IssueCard
        index={1}
        issue={{ category: "other", title: "Odd noise", confidence: 0.3, evidence: "Unclear.", guideId: null }}
      />,
    );
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText(/No guide for this one yet/)).toBeInTheDocument();
    expect(screen.getByText(/\(low\)/).parentElement).toHaveTextContent("30% (low)");
  });
});

describe("DemoBanner", () => {
  it("shows the exact demo-mode text", () => {
    render(<DemoBanner />);
    expect(screen.getByText(DEMO_BANNER_TEXT)).toBeInTheDocument();
    expect(DEMO_BANNER_TEXT).toBe("Demo mode — sample rule-based diagnosis, no AI key configured");
  });
});
