export type TaxFreeRule = {
ruleId: string;
countryId: string;
currency: string;
vatRate: number;
minimumSpend: number;
estimatedRefundRate: number;
refundProcessSteps: string[];
updatedAt: string;
};

export const taxFreeRules: TaxFreeRule[] = [
{
ruleId: "france-tax-free",
countryId: "france",
currency: "EUR",
vatRate: 20,
minimumSpend: 100,
estimatedRefundRate: 12,
refundProcessSteps: [
"Ask for a Tax Free form at the store.",
"Keep your passport information ready.",
"Validate your Tax Free form before leaving the EU.",
"Claim your refund by card or cash depending on the provider.",
],
updatedAt: "2026-06-19",
},
{
ruleId: "italy-tax-free",
countryId: "italy",
currency: "EUR",
vatRate: 22,
minimumSpend: 70,
estimatedRefundRate: 12,
refundProcessSteps: [
"Ask for a Tax Free form at the store.",
"Keep invoices and receipts together.",
"Validate the form at your final EU exit point.",
"Receive your refund through the selected refund method.",
],
updatedAt: "2026-06-19",
},
{
ruleId: "germany-tax-free",
countryId: "germany",
currency: "EUR",
vatRate: 19,
minimumSpend: 50,
estimatedRefundRate: 10,
refundProcessSteps: [
"Ask for a Tax Free form at the store.",
"Keep your receipt and Tax Free documents.",
"Validate your documents before leaving the EU.",
"Claim your refund through the refund provider.",
],
updatedAt: "2026-06-19",
},
{
ruleId: "spain-tax-free",
countryId: "spain",
currency: "EUR",
vatRate: 21,
minimumSpend: 0,
estimatedRefundRate: 12,
refundProcessSteps: [
"Ask for a Tax Free form when shopping.",
"Keep your passport details ready.",
"Validate your Tax Free documents before leaving the EU.",
"Choose card or cash refund depending on provider availability.",
],
updatedAt: "2026-06-19",
},
{
ruleId: "switzerland-tax-free",
countryId: "switzerland",
currency: "CHF",
vatRate: 8.1,
minimumSpend: 300,
estimatedRefundRate: 5,
refundProcessSteps: [
"Ask for a Tax Free form at the store.",
"Keep your original receipt.",
"Validate export documents when leaving Switzerland.",
"Claim your refund through the provider.",
],
updatedAt: "2026-06-19",
},
{
ruleId: "united-arab-emirates-tax-free",
countryId: "united-arab-emirates",
currency: "AED",
vatRate: 5,
minimumSpend: 250,
estimatedRefundRate: 4,
refundProcessSteps: [
"Ask the store to create a Tax Free transaction.",
"Keep your passport information ready.",
"Validate your Tax Free transaction before departure.",
"Receive your refund through the available refund method.",
],
updatedAt: "2026-06-19",
},
{
ruleId: "japan-tax-free",
countryId: "japan",
currency: "JPY",
vatRate: 10,
minimumSpend: 5000,
estimatedRefundRate: 8,
refundProcessSteps: [
"Shop at a Tax Free eligible store.",
"Show your passport at the store.",
"Follow the store's Tax Free procedure.",
"Keep purchased goods according to local Tax Free rules.",
],
updatedAt: "2026-06-19",
},
{
ruleId: "south-korea-tax-free",
countryId: "south-korea",
currency: "KRW",
vatRate: 10,
minimumSpend: 15000,
estimatedRefundRate: 7,
refundProcessSteps: [
"Ask for Tax Free purchase processing at the store.",
"Keep receipts and refund documents.",
"Validate refund at airport or refund kiosk if required.",
"Receive your refund by card, cash or digital method.",
],
updatedAt: "2026-06-19",
},
{
ruleId: "china-tax-free",
countryId: "china",
currency: "CNY",
vatRate: 13,
minimumSpend: 500,
estimatedRefundRate: 9,
refundProcessSteps: [
"Shop at eligible Tax Free stores.",
"Ask for the Tax Free refund form.",
"Validate your documents before departure.",
"Claim your refund through the designated refund channel.",
],
updatedAt: "2026-06-19",
},
{
ruleId: "thailand-tax-free",
countryId: "thailand",
currency: "THB",
vatRate: 7,
minimumSpend: 2000,
estimatedRefundRate: 5,
refundProcessSteps: [
"Shop at stores displaying VAT Refund for Tourists.",
"Ask for the VAT refund application form.",
"Present goods and documents before departure if required.",
"Claim the refund at the airport refund counter.",
],
updatedAt: "2026-06-19",
},
{
ruleId: "united-kingdom-tax-free",
countryId: "united-kingdom",
currency: "GBP",
vatRate: 20,
minimumSpend: 0,
estimatedRefundRate: 0,
refundProcessSteps: [
"Tax Free shopping is limited or unavailable for most visitors.",
"Check current rules before making large purchases.",
],
updatedAt: "2026-06-19",
},
{
ruleId: "united-states-tax-free",
countryId: "united-states",
currency: "USD",
vatRate: 0,
minimumSpend: 0,
estimatedRefundRate: 0,
refundProcessSteps: [
"The United States does not have a standard nationwide VAT refund system.",
"Sales tax rules vary by state.",
],
updatedAt: "2026-06-19",
},
];