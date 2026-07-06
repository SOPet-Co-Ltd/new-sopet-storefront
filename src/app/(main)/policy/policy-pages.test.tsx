import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import PrivacyPolicyPage from "./privacy-policy/page";
import RefundPolicyPage from "./refund-policy/page";
import TermsOfServicePage from "./terms-of-service/page";

describe("policy pages", () => {
  it("renders terms of service title and key sections", () => {
    render(<TermsOfServicePage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "นโยบายการใช้งาน" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "เงื่อนไขการให้บริการของ Sopet",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "ข้อกำหนดการใช้งาน ดังนี้" }),
    ).toBeInTheDocument();
  });

  it("renders privacy policy title and key sections", () => {
    render(<PrivacyPolicyPage />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "นโยบายความเป็นส่วนตัว",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "ข้อมูลส่วนบุคคลที่เราเก็บรวบรวมหรือประมวลผล",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "ติดต่อ" }),
    ).toBeInTheDocument();
  });

  it("renders refund policy title and key sections", () => {
    render(<RefundPolicyPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "นโยบายการคืนเงิน" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "1. ขอบเขตของนโยบาย" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "2. กรณีที่แพลตฟอร์มรับผิดชอบเต็มจำนวน (คืนเงิน 100%)",
      }),
    ).toBeInTheDocument();
  });
});
