export const fmt = (dt) =>
  new Date(dt).toLocaleString("uk-UA", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })

export const duration = (start, end) => {
  const m = (new Date(end) - new Date(start)) / 60000
  const h = Math.floor(m / 60)
  const min = m % 60
  return h > 0 ? `${h} год${min > 0 ? ` ${min} хв` : ""}` : `${min} хв`
}

export const estimateCost = (startDayjs, endDayjs, pricePerHour) => {
  if (!startDayjs?.isValid() || !endDayjs?.isValid() || !pricePerHour) return null
  const hours = endDayjs.diff(startDayjs, "minute") / 60
  return hours > 0 ? hours * Number(pricePerHour) : null
}
