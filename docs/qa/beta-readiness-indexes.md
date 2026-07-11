# Beta Readiness Firestore Index Notes

The backend account-deletion callable anonymizes reviews with a collection group query over review item documents. Ensure this Firestore index exists before beta destructive-account QA:

- Collection group: `items`
- Field: `userId`
- Mode: Ascending
