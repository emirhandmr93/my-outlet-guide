const transportationTypeKeys: Record<string, string> = {
  airport: "transportation.type.airport",
  bus: "transportation.type.bus",
  car: "transportation.type.car",
  ferry: "transportation.type.ferry",
  shuttle: "transportation.type.shuttle",
  taxi: "transportation.type.taxi",
  train: "transportation.type.train",
  walking: "transportation.type.walking",
};

export function formatTransportationTypeLabel(
  transportType: string,
  t: (key: string) => string,
) {
  const translationKey = transportationTypeKeys[transportType.trim().toLowerCase()];

  return translationKey ? t(translationKey) : transportType;
}
