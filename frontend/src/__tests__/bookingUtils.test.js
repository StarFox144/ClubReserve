import { describe, it, expect } from "vitest"
import dayjs from "dayjs"
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
  it("calculates cost for 2 hours at 60/h", () => {
    const start = dayjs("2026-05-04T10:00")
    const end = dayjs("2026-05-04T12:00")
    expect(estimateCost(start, end, 60)).toBe(120)
  })

  it("calculates cost with decimal hours at 50/h", () => {
    const start = dayjs("2026-05-04T10:00")
    const end = dayjs("2026-05-04T11:30")
    expect(estimateCost(start, end, 50)).toBe(75)
  })

  it("returns null when end is before start", () => {
    const start = dayjs("2026-05-04T12:00")
    const end = dayjs("2026-05-04T10:00")
    expect(estimateCost(start, end, 60)).toBe(null)
  })

  it("returns null when no price", () => {
    const start = dayjs("2026-05-04T10:00")
    const end = dayjs("2026-05-04T12:00")
    expect(estimateCost(start, end, null)).toBe(null)
  })

  it("returns null for invalid dates", () => {
    const inv = dayjs("not-a-date")
    expect(estimateCost(inv, inv, 50)).toBe(null)
  })
})
