# Reviews & Ratings Policy

Reviews & Ratings V1 must be production-safe:

- Do not ship fake reviews, mock reviews, placeholder review text, or seeded helpful counts.
- Do not display `0` or `0.0` as an outlet rating unless it is a real rating from a trusted production source.
- When real rating data is missing, show a neutral no-rating state or hide compact rating badges.
- When real review data is missing, show the final empty state: “No reviews yet.” / “Henüz yorum yok.”
- Do not allow users to create or edit outlet reviews until production-ready backend storage, moderation, abuse reporting, and operational review handling are available.
- Review counts must come from real loaded review records or a trusted production source; do not invent counts.
