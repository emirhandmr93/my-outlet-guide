export type Deal = {
dealId: string;
brandId: string;
cityId: string;
outletId: string;
title: string;
description: string;
startDate: string;
endDate: string;
dealType: "sale" | "extra_discount" | "tax_free" | "event";
};

/** Campaigns are server-verified Firestore records; no unverified samples ship in the app bundle. */
export const deals: Deal[] = [];
