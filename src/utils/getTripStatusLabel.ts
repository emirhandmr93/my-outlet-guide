export function getTripStatusLabel(status: string, t: (key: string) => string) {
  if (status === "Upcoming") {
    return t("status.upcoming");
  }

  if (status === "Active") {
    return t("status.active");
  }

  if (status === "Completed") {
    return t("status.completed");
  }

  return status;
}
