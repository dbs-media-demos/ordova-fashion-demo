export const faqs: { group: string; items: { q: string; a: string }[] }[] = [
  {
    group: "Orders & shipping",
    items: [
      { q: "How much is shipping?", a: "Standard shipping is free on orders over $150 and $8 otherwise (3–5 business days). Express is $18 (1–2 business days). We ship to all 50 states from our Bishop Arts studio." },
      { q: "When will my order ship?", a: "Orders placed before 2 pm Central ship the same business day; everything else ships the next business day. You'll get tracking by email." },
      { q: "Can I pick up in store?", a: "Yes — choose “Pick up in store” at checkout. Orders are ready in about two hours during opening hours and we'll text you when they are. Pickup is always free." },
      { q: "Do you deliver same-day in Dallas?", a: "Weekdays before noon, we can courier to Oak Cliff, Bishop Arts, Uptown, Deep Ellum and the Design District for $12. Call the shop to arrange it." },
    ],
  },
  {
    group: "Returns & exchanges",
    items: [
      { q: "What's your return policy?", a: "Free returns and exchanges within 30 days of delivery, sale pieces included. Items should be unworn with tags attached. A prepaid label is in every box." },
      { q: "How fast are refunds?", a: "We refund to your original payment method within 2 business days of the return reaching us. Your bank may take 3–5 days to show it." },
      { q: "Can I exchange for a different size?", a: "Yes, and we'll ship the new size as soon as your return is scanned by the carrier — you don't have to wait for it to arrive." },
    ],
  },
  {
    group: "Fit & sizing",
    items: [
      { q: "How do your sizes run?", a: "Most pieces are true to size; each product page shows the model's height and size plus a fit slider based on customer reviews. The Fit Finder suggests a size in four questions." },
      { q: "Do you offer alterations?", a: "Free hemming on any trouser or skirt bought from us, usually while you wait in the shop. Other alterations are quoted at the counter." },
      { q: "Can I book a styling appointment?", a: "Yes — 45 minutes with one of our team, free, in the shop or by video. Book on the Visit page." },
    ],
  },
  {
    group: "The label",
    items: [
      { q: "Where are your clothes made?", a: "Most of our label is cut and sewn in our studio a mile from the shop, in runs of about thirty. Knitwear is knitted in Los Angeles and finished here; some fabrics come from Italy, Belgium and Japan. Each product page lists its origin." },
      { q: "What happens when a size sells out?", a: "Current pieces are recut a few times a season — tap “Notify me” on a sold-out size. Archive pieces are never recut." },
      { q: "Do you sell gift cards?", a: "Yes, from $50 to $500, by email or wrapped in store. They never expire." },
    ],
  },
];

export const allFaqs = faqs.flatMap((g) => g.items);
