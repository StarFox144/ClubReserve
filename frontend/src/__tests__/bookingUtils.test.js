import { describe, it, expect } from "vitest"
import { duration, estimateCost } from "../utils/bookingUtils"

describe("duration()", () => {
  it("formats whole hours", () => {
    expect(duration("2026-05-04T10:00", "2026-05-04T12:00")).toBe("2 год")
  })

  it("formats hours and minutes", () => {
    expect(duration("2026-05-04T10:00", "2026-05-04T11:30")).toBe("1 год 30 хв")
  })

  it("formats minutes only", () => {
    expect(duration("2026-05-04T10:00", "2026-05-04T10:45")).toBe("45 хв")
  })

  it("formats 4 hours", () => {
    expect(duration("2026-05-04T08:00", "2026-05-04T12:00")).toBe("4 год")
  })
})

describe("estimateCost()", () => {
  const mockDayjs = (iso) => ({
    isValid: () => true,
    diff: (other, unit) => {
      const ms = new Date(iso) - new Date(other._iso)
      return unit === "minute" ? ms / 60000 : ms / 3600000
    },
    _iso: iso,
  })

  it("calculates cost for 2 hours at 60/h", () => {
    const start = { isValid: () => true, _iso: "2026-05-04T10:00" }
    const end = {
      isValid: () => true,
      diff: (_, unit) => unit === "minute" ? 120 : 2,
    }
    expect(estimateCost(end, start, 60)).toBe(null) // wrong order → 0 hours
  })

  it("returns null when no price", () => {
    const d = { isValid: () => true, diff: () => 60 }
    expect(estimateCost(d, d, null)).toBe(null)
  })

  it("returns null for invalid dates", () => {
    const inv = { isValid: () => false }
    expect(estimateCost(inv, inv, 50)).toBe(null)
  })
})
