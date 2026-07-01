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

export const deals: Deal[] = [
{
dealId: "gucci-paris-summer-sale",
brandId: "gucci",
cityId: "paris",
outletId: "la-vallee-village",
title: "Gucci Summer Sale",
description: "Selected Gucci products are available with seasonal discounts.",
startDate: "2026-06-20",
endDate: "2026-06-23",
dealType: "sale",
},

{
dealId: "gucci-paris-tax-free",
brandId: "gucci",
cityId: "paris",
outletId: "la-vallee-village",
title: "Gucci Tax Free Shopping",
description: "Remember to request your Tax Free form for eligible Gucci purchases.",
startDate: "2026-06-20",
endDate: "2026-06-24",
dealType: "tax_free",
},

{
dealId: "prada-serravalle-extra-discount",
brandId: "prada",
cityId: "milan",
outletId: "serravalle",
title: "Prada Extra Outlet Discount",
description: "Extra savings available on selected Prada items.",
startDate: "2026-06-24",
endDate: "2026-06-26",
dealType: "extra_discount",
},

{
dealId: "nike-bicester-weekend-offer",
brandId: "nike",
cityId: "london",
outletId: "bicester-village",
title: "Nike Weekend Shopping Offer",
description: "Weekend promotion available on selected Nike products.",
startDate: "2026-06-22",
endDate: "2026-06-24",
dealType: "sale",
},
];