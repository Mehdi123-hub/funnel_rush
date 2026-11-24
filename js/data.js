// Total number of rounds per game session
export const TOTAL_ROUNDS = 6;

// Total prospect tokens each player starts with (Market + Funnel = 30)
export const TOTAL_TOKENS = 30;

// Player token colors assigned in player order (2 to 4 players)
export const PLAYER_COLORS = [
  "#00b386", // Player 1 token color (teal/green)
  "#ec4899", // Player 2 token color (pink)
  "#f97316", // Player 3 token color (orange)
  "#3b82f6"  // Player 4 token color (blue)
];

// The 5 marketing funnel stages with their display names and colors
export const FLOORS = [
  { id: "awareness",     name: "Awareness",     color: "#CDEFF3" }, // Stage 1: top of funnel
  { id: "interest",      name: "Interest",      color: "#8FDCE5" }, // Stage 2: engagement
  { id: "consideration", name: "Consideration", color: "#3FBCCB" }, // Stage 3: evaluation
  { id: "conversion",    name: "Conversion",    color: "#1A8291" }, // Stage 4: purchase
  { id: "loyalty",       name: "Loyalty",       color: "#0E4F58" }  // Stage 5: retention
];

// Action cards available in Level 1 (12 cards) and Level 2 (3 additional cards = 15 total)
export const CARDS = [
  {
    id: "instagram-ad", // Unique slug used for card anchors
    name: "Instagram Ad", // Card display name
    floor: "awareness", // Funnel stage identifier
    cost: 3, // Coin cost from the bank
    level: 1, // Available starting at Level 1
    effect: "Move 4 prospects from Market to Awareness.", // Exact mechanical effect
    definition: "Paid advertising shown on Instagram to a chosen audience (age, interests, location). It reaches many people quickly.", // Marketing lever definition
    example: "Sponsoring a Story aimed at 18–30-year-olds who love fitness to introduce your app." // Concrete example
  },
  {
    id: "seo-article",
    name: "SEO Article",
    floor: "awareness",
    cost: 1,
    level: 1,
    effect: "Move 2 prospects from Market to Awareness.",
    definition: "A blog post optimized to appear in search engine results. Low cost, but organic traffic builds up slowly.",
    example: "Publishing a guide on “How to manage a student budget” targeting search queries."
  },
  {
    id: "influencer-partnership",
    name: "Influencer Partnership",
    floor: "awareness",
    cost: 5,
    level: 1,
    effect: "Move 6 prospects from Market to Awareness.",
    definition: "A collaboration with a creator followed by a large community who introduces your brand to their audience.",
    example: "Having a trusted creator review your product in a dedicated video."
  },
  {
    id: "newsletter",
    name: "Newsletter",
    floor: "interest",
    cost: 2,
    level: 1,
    effect: "Move 3 prospects from Awareness to Interest.",
    definition: "An email sent regularly to subscribers to stay in touch and keep their interest alive.",
    example: "Sending a weekly digest with product updates and helpful tips."
  },
  {
    id: "white-paper",
    name: "White Paper",
    floor: "interest",
    cost: 3,
    level: 1,
    effect: "Move 4 prospects from Awareness to Interest.",
    definition: "A free in-depth guide offered in exchange for an email address—a lead magnet that turns visitors into contacts.",
    example: "Offering a PDF called “10 mistakes to avoid when launching a startup” on sign-up."
  },
  {
    id: "webinar",
    name: "Webinar",
    floor: "consideration",
    cost: 3,
    level: 1,
    effect: "Move 3 prospects from Interest to Consideration.",
    definition: "A live online session where the brand demonstrates its expertise and answers questions.",
    example: "Hosting a 30-minute live product demo followed by a Q&A."
  },
  {
    id: "customer-reviews",
    name: "Customer Reviews",
    floor: "consideration",
    cost: 2,
    level: 1,
    effect: "Move 2 prospects to Consideration. Place this card face up in front of you (outside your hand): it cancels the next “Bad Review”.",
    definition: "Ratings and testimonials from customers. This social proof reassures prospects who are comparing options.",
    example: "Displaying a 4.8/5 rating and verified customer quotes on your product page."
  },
  {
    id: "marketing-automation",
    name: "Marketing Automation",
    floor: "consideration",
    cost: 4,
    level: 2,
    effect: "Move 2 prospects from Interest to Consideration AND 1 prospect from Awareness to Interest.",
    definition: "Automated emails or messages triggered by a prospect's behavior (sign-up, click, visit) to guide them step by step without manual effort.",
    example: "Automatically triggering a welcome sequence after someone downloads a guide."
  },
  {
    id: "free-trial",
    name: "Free Trial",
    floor: "conversion",
    cost: 4,
    level: 1,
    effect: "Move 3 prospects from Consideration to Conversion.",
    definition: "A free period to try the product before paying, removing final doubts before purchase.",
    example: "Offering a 14-day full access trial before a monthly subscription starts."
  },
  {
    id: "promo-code",
    name: "Promo Code",
    floor: "conversion",
    cost: 2,
    level: 1,
    effect: "Move 2 prospects to Conversion. Your revenue is divided by 2 this round.",
    definition: "A discount that encourages immediate purchase at the cost of a lower margin.",
    example: "Offering 20% off a first order for 48 hours."
  },
  {
    id: "ab-test",
    name: "A/B Test",
    floor: "conversion",
    cost: 3,
    level: 2,
    effect: "Move 2 prospects to Conversion. On a die roll of 2 or 3, the card still succeeds normally.",
    definition: "Testing two versions of a page or email with two groups and keeping whichever converts better.",
    example: "Comparing two checkout button labels to see which gets more completed orders."
  },
  {
    id: "loyalty-program",
    name: "Loyalty Program",
    floor: "loyalty",
    cost: 3,
    level: 1,
    effect: "Move 2 customers from Conversion to Loyalty.",
    definition: "Points, perks, or tiers reserved for existing customers to bring them back.",
    example: "Earning reward points on every order that can be redeemed for perks."
  },
  {
    id: "referral-program",
    name: "Referral Program",
    floor: "loyalty",
    cost: 3,
    level: 1,
    effect: "Move 1 customer to Loyalty AND add 2 prospects to Awareness.",
    definition: "Customers recommend the brand to friends and family, often in exchange for a reward.",
    example: "Giving both the referrer and friend a bonus once the friend makes a first purchase."
  },
  {
    id: "customer-support",
    name: "Customer Support",
    floor: "loyalty",
    cost: 2,
    level: 2,
    effect: "Move 1 customer to Loyalty. No churn die roll for you this round.",
    definition: "Help provided to customers after purchase. Well-supported customers stay longer and recommend the brand.",
    example: "Providing fast live support and onboarding check-ins after a customer joins."
  },
  {
    id: "retargeting",
    name: "Retargeting",
    floor: "consideration",
    cost: 3,
    level: 1,
    effect: "Bring 2 prospects from Lost back to Consideration.",
    definition: "Ads shown to people who already visited the site without buying, bringing them back into the funnel.",
    example: "Showing a reminder ad to visitors who left items in their cart."
  }
];

// Round events: 6 for Level 1, plus 4 harder events unlocked in Level 2 (10 total)
export const EVENTS = [
  {
    id: "google-algorithm-update", // Unique event identifier
    name: "Google Algorithm Update", // Event title
    level: 1, // Available in Level 1 and Level 2
    effect: "SEO Article cards add only 1 prospect this round." // Round effect
  },
  {
    id: "bad-review",
    name: "Bad Review",
    level: 1,
    effect: "Each player loses 2 prospects in Consideration. Customer Reviews protects you."
  },
  {
    id: "viral-post",
    name: "Viral Post",
    level: 1,
    effect: "The player with the fewest prospects in Awareness adds 3."
  },
  {
    id: "competitor-launch",
    name: "Competitor Launch",
    level: 1,
    effect: "Each player loses 1 prospect on every stage that has 3 or more."
  },
  {
    id: "black-friday",
    name: "Black Friday",
    level: 1,
    effect: "Free Trial, Promo Code, and A/B Test cost 1 coin less this round."
  },
  {
    id: "website-bug",
    name: "Website Bug",
    level: 1,
    effect: "No one can play Free Trial, Promo Code, or A/B Test this round."
  },
  {
    id: "ad-price-hike",
    name: "Ad Price Hike",
    level: 2, // Level 2 event only
    effect: "Instagram Ad and Influencer Partnership cost 2 coins more."
  },
  {
    id: "gdpr-audit",
    name: "GDPR Audit",
    level: 2,
    effect: "Each player pays 2 coins to the bank for compliance."
  },
  {
    id: "economic-downturn",
    name: "Economic Downturn",
    level: 2,
    effect: "All revenues are divided by 2 (rounded down)."
  },
  {
    id: "churn-spike",
    name: "Churn Spike",
    level: 2,
    effect: "The churn die makes a customer leave on a roll of 1, 2, or 3."
  }
];