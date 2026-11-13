export const site = {
  name: "Indoor Gardening Pro",
  tagline: "Practical guides for growing healthy plants indoors",
  description:
    "Plain-English guides to houseplants, indoor herbs and vegetables, grow lights, hydroponics and plant care, from Indoor Gardening Pro.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://indoorgardeningpro.com",
  nav: [
    { href: "/plant-guide/", label: "Plant Guide" },
    { href: "/plant-care/", label: "Plant Care" },
    { href: "/green-house/", label: "Greenhouse & Hydroponics" },
    { href: "/blog/", label: "All Articles" },
    { href: "/about/", label: "About" },
  ],
  footer: [
    { href: "/about/", label: "About" },
    { href: "/contact/", label: "Contact" },
    { href: "/privacy-policy/", label: "Privacy Policy" },
    { href: "/affiliate-disclosure/", label: "Affiliate Disclosure" },
  ],
};
