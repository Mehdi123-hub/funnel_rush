// Nombre total de manches et nombre de pions de départ par joueur (1 pion = 5 prospects)
export const TOTAL_ROUNDS = 6;
export const PAWNS_PER_PLAYER = 6;

// Pièces de départ selon le niveau
export const LEVEL_CONFIG = {
  1: { startingCoins: 20 },
  2: { startingCoins: 15 },
};

// Couleurs des pions joueurs
export const PLAYER_COLORS = [
  { name: "Teal", hex: "#00B386" },
  { name: "Pink", hex: "#FF5FC8" },
  { name: "Orange", hex: "#F97316" },
  { name: "Blue", hex: "#2F7BFF" },
];

// Les 5 étapes du funnel (du froid vers le chaud) + catégorie spéciale
export const FLOORS = [
  { id: "awareness", name: "AWARENESS", color: "#A3ACD6" },
  { id: "interest", name: "INTEREST", color: "#739BFF" },
  { id: "consideration", name: "CONSIDERATION", color: "#8673FF" },
  { id: "conversion", name: "CONVERSION", color: "#D25FFF" },
  { id: "loyalty", name: "LOYALTY", color: "#FF73D2" },
];

// Accès rapide aux étapes par identifiant
export const FUNNEL_FLOORS = Object.fromEntries(
  FLOORS.map((f) => [f.id, { label: f.name, color: f.color }])
);

// Catalogue complet des 17 cartes Action (14 au niveau 1 dont Buzz/Bad Buzz, 3 au niveau 2)
export const CARDS = [
  { id: "instagram-ad", name: "Instagram Ad", floor: "awareness", cost: 3, level: 1, special: false, effect: "Move 4 prospects (or 1 pawn) from Market to Awareness.", definition: "Paid social ads targeting specific audiences.", example: "Sponsoring a Story for fitness fans." },
  { id: "seo-article", name: "SEO Article", floor: "awareness", cost: 1, level: 1, special: false, effect: "Move 2 prospects from Market to Awareness.", definition: "Search-optimized article building organic traffic.", example: "Publishing a student budget guide." },
  { id: "influencer-partnership", name: "Influencer Partnership", floor: "awareness", cost: 5, level: 1, special: false, effect: "Move 6 prospects from Market to Awareness.", definition: "Creator collaboration reaching an established audience.", example: "A creator testing your product on video." },
  { id: "newsletter", name: "Newsletter", floor: "interest", cost: 2, level: 1, special: false, effect: "Move 3 prospects from Awareness to Interest.", definition: "Regular email updates keeping subscribers engaged.", example: "Weekly tips and product digest." },
  { id: "white-paper", name: "White Paper", floor: "interest", cost: 3, level: 1, special: false, effect: "Move 4 prospects from Awareness to Interest.", definition: "Free detailed guide exchanged for contact info.", example: "PDF checklist offered on sign-up." },
  { id: "webinar", name: "Webinar", floor: "consideration", cost: 3, level: 1, special: false, effect: "Move 3 prospects from Interest to Consideration.", definition: "Live online session demonstrating value.", example: "30-minute live demo with Q&A." },
  { id: "customer-reviews", name: "Customer Reviews", floor: "consideration", cost: 2, level: 1, special: false, effect: "Move 2 prospects to Consideration. Cancels next Bad Review or Bad Buzz.", definition: "Ratings and testimonials building trust.", example: "Displaying verified buyer quotes." },
  { id: "marketing-automation", name: "Marketing Automation", floor: "consideration", cost: 4, level: 2, special: false, effect: "Move 2 Interest -> Consideration and 1 Awareness -> Interest.", definition: "Behavior-triggered automated messages.", example: "Welcome sequence after a download." },
  { id: "retargeting", name: "Retargeting", floor: "consideration", cost: 3, level: 1, special: true, effect: "Bring 1 pawn back from Lost to Consideration.", definition: "Ads re-engaging past visitors who left without buying.", example: "Cart reminder ads." },
  { id: "free-trial", name: "Free Trial", floor: "conversion", cost: 4, level: 1, special: false, effect: "Move 2 pawns from Consideration to Conversion.", definition: "Risk-free trial period before buying.", example: "14-day full access trial." },
  { id: "promo-code", name: "Promo Code", floor: "conversion", cost: 2, level: 1, special: false, effect: "Move 2 prospects to Conversion. Revenue halved this round.", definition: "Discount driving immediate purchase.", example: "20% off first order." },
  { id: "ab-test", name: "A/B Test", floor: "conversion", cost: 3, level: 2, special: false, effect: "Move 2 to Conversion. Succeeds on die roll 2 or 3.", definition: "Comparing two variants to keep the best.", example: "Testing two checkout buttons." },
  { id: "buzz", name: "Buzz", floor: "conversion", cost: 5, level: 1, special: true, effect: "Take a Buzz pawn and place it directly in Conversion. Counts like your own pawns.", definition: "Viral word-of-mouth driving hesitant prospects straight to purchase.", example: "A viral video causing an instant spike in orders." },
  { id: "loyalty-program", name: "Loyalty Program", floor: "loyalty", cost: 3, level: 1, special: false, effect: "Move 2 customers from Conversion to Loyalty.", definition: "Rewards for repeat customers.", example: "Points earned on every order." },
  { id: "referral-program", name: "Referral Program", floor: "loyalty", cost: 3, level: 1, special: false, effect: "Move 1 to Loyalty and add 2 to Awareness.", definition: "Customers inviting friends for a reward.", example: "Bonus credit for referrer and friend." },
  { id: "customer-support", name: "Customer Support", floor: "loyalty", cost: 2, level: 2, special: false, effect: "Move 1 to Loyalty. No churn roll for you this round.", definition: "Post-purchase help retaining buyers.", example: "Fast onboarding and support." },
  { id: "bad-buzz", name: "Bad Buzz", floor: "loyalty", cost: 0, level: 1, special: true, effect: "Place in front of an opponent: at the start of their next turn, their most advanced pawn goes back to Awareness (blocked by Customer Reviews).", definition: "A public backlash forcing a brand to win back lost trust from scratch.", example: "Negative social media controversy hurting brand reputation." },
];

// Les 10 événements (6 au niveau 1 + 4 supplémentaires au niveau 2)
export const EVENTS = [
  { id: "algorithm-update", title: "Algorithm Update", floor: "awareness", level: 1, effect: "SEO Article cards don't work this round." },
  { id: "bad-review", title: "Bad Review", floor: "consideration", level: 1, effect: "Every player loses 1 pawn from Consideration, which goes to Lost. Customer Reviews protects you." },
  { id: "viral-post", title: "Viral Post", floor: "awareness", level: 1, effect: "The player with the fewest pawns in Awareness brings 1 in from the Market." },
  { id: "competitor-launch", title: "Competitor Launch", floor: "interest", level: 1, effect: "Every player loses 1 pawn from the floor where they have the most (if it holds at least 2)." },
  { id: "black-friday", title: "Black Friday", floor: "conversion", level: 1, effect: "Free Trial, Promo Code and A/B Test cost 1 coin less this round." },
  { id: "website-bug", title: "Website Bug", floor: "conversion", level: 1, effect: "Nobody can play Free Trial, Promo Code, A/B Test or Buzz this round." },
  { id: "ad-price-increase", title: "Ad Price Increase", floor: "awareness", level: 2, effect: "Instagram Ad and Influencer Partnership cost 2 more coins." },
  { id: "gdpr-audit", title: "GDPR Audit", floor: "interest", level: 2, effect: "Every player pays 2 coins to the bank to become compliant." },
  { id: "economic-crisis", title: "Economic Crisis", floor: "conversion", level: 2, effect: "All revenue is halved (round down)." },
  { id: "churn-peak", title: "Churn Peak", floor: "loyalty", level: 2, effect: "The churn die makes a pawn leave on 1, 2 or 3." },
];

// Calcule les points selon les nouvelles règles :
// 3 pts/pion Loyalty, 2 pts/pion Conversion, 1 pt/5 pièces restantes, +5 pts Mission (niveau 2)
export function computePlayerScore(sc, level = 2) {
  const loyalty = Math.max(0, Number(sc?.loyalty) || 0);
  const conversion = Math.max(0, Number(sc?.conversion) || 0);
  const coins = Math.max(0, Number(sc?.coins) || 0);
  const market = Math.max(0, Number(sc?.market) || 0);
  const buzz = Math.max(0, Number(sc?.buzz) || 0);

  const missionBonus = level === 2 && Boolean(sc?.mission) ? 5 : 0;
  const coinPoints = Math.floor(coins / 5);
  const basePoints = 3 * loyalty + 2 * conversion + coinPoints + missionBonus;

  // Taux de conversion = (Loyalty + Conversion) / (6 + Buzz - Market)
  const entered = PAWNS_PER_PLAYER + buzz - market;
  const customers = loyalty + conversion;
  const conversionRate = entered > 0 ? customers / entered : 0;

  return {
    loyalty,
    conversion,
    coins,
    conversionRate,
    hasConversionBonus: false,
    basePoints,
    totalPoints: basePoints,
  };
}

// Ajoute +3 pts au(x) meilleur(s) taux de conversion et trie : points, puis Loyalty, puis pièces
export function rankPlayers(players) {
  const maxRate = Math.max(0, ...players.map((p) => p.conversionRate || 0));
  return players
    .map((p) => {
      const bonus = maxRate > 0 && Math.abs((p.conversionRate || 0) - maxRate) < 1e-9;
      return { ...p, hasConversionBonus: bonus, totalPoints: p.basePoints + (bonus ? 3 : 0) };
    })
    .sort((a, b) => b.totalPoints - a.totalPoints || b.loyalty - a.loyalty || b.coins - a.coins);
}