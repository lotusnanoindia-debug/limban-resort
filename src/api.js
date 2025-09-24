import { request } from "graphql-request";

const HYGRAPH_URL =
  "https://ap-south-1.cdn.hygraph.com/content/cmek3o66w01vb07w64qwgkybp/master";

// Clean image fragment
const IMAGE_FRAGMENT = `
  fragment CleanImage on Asset {
    id
    url
    width
    height
    fileName
  }
`;

// QUERIES - Clean and focused
const HERO_QUERY = `
  query GetHeroSlides {
    heroSlides(where: { active: true }, orderBy: displayOrder_ASC) {
      id
      slideTitle
      subtitle
      backgroundImage { ...CleanImage }
      ctaText
      ctaLink
      displayOrder
      active
    }
  }
  ${IMAGE_FRAGMENT}
`;

const ROOMS_QUERY = `
  query GetRooms {
    rooms {
      id
      roomName
      url
      shortDescription
      basePrice
      heroImage { ...CleanImage }
      gallery(first: 100) {
        ... on RoomGalleryItem {
          id
          image { ...CleanImage }
          caption
        }
      }
      roomFeature(first: 100) {
        id
        featureName
        svgImage
      }
    }
  }
  ${IMAGE_FRAGMENT}
`;

const ROOM_BY_SLUG_QUERY = `
  query GetRoomBySlug($slug: String!) {
    rooms(where: { url: $slug }, first: 1) {
      id
      roomName
      url
      shortDescription
      description { html }
      basePrice
      heroImage { ...CleanImage }
      gallery(first: 100) {
        ... on RoomGalleryItem {
          id
          image { ...CleanImage }
          caption
        }
      }
      roomFeature(first: 100) {
        id
        featureName
        svgImage
      }
    }
  }
  ${IMAGE_FRAGMENT}
`;

const DINING_QUERY = `
  query GetDining {
    restaurants(first: 100) {
      id
      restaurantName
      url
      shortIntro
      longDescription
      logo { ...CleanImage }
      images(first: 100) { ...CleanImage }
    }
  }
  ${IMAGE_FRAGMENT}
`;

const DINING_BY_SLUG_QUERY = `
  query GetDiningBySlug($url: String!) {
    restaurants(where: { url: $url }, first: 1) {
      id
      restaurantName
      url
      shortIntro
      longDescription
      logo { ...CleanImage }
      images(first: 20) { ...CleanImage }
    }
  }
  ${IMAGE_FRAGMENT}
`;

const SUB_HERO_QUERY = `
  query GetSubHero {
    subHeroSections {
      id
      aboveHeader
      title
      imageAltText
      bodyText { html }
      image { ...CleanImage }
      stats { 
        number 
        label 
        svg 
      }
    }
  }
  ${IMAGE_FRAGMENT}
`;

const SERVICES_QUERY = `
  query GetServices {
    experienceSections {
      aboveHeader
      title
      description
      experience {
        title
        description
        link
        buttonText
        imageAltText
        image { ...CleanImage }
        feature { text }
      }
    }
  }
  ${IMAGE_FRAGMENT}
`;

const SAFARI_QUERY = `
  query GetSafariExperiences {
    safaris(
      where: { isActive: true }
      orderBy: sortOrder_ASC
    ) {
      id
      title
      subtitle
      description
      image { ...CleanImage }
      altText
      duration
      isActive
      sortOrder
    }
  }
  ${IMAGE_FRAGMENT}
`;

const ABOUT_PAGE_QUERY = `
  query GetAboutPage {
    aboutPage(where: {id: "cmeyayyex8xsc07pc8u9cgfxq"}) {
      heroImage { ...CleanImage }
      philosophyImage { ...CleanImage }
      foundersImage { ...CleanImage }
      teamImages(first: 100) { ...CleanImage }
    }
    vibeGallery(where: {id: "cmf0lo9eja9wk07pcwlzw8zdh"}) {
      title
      images(first: 100) {
        image { ...CleanImage }
        altText
      }
    }
    guestGallery: guestGalleries(first: 1) {
      images(first: 500) { ...CleanImage }
    }
  }
  ${IMAGE_FRAGMENT}
`;

const VIBE_PAGE_QUERY = `
  query GetVibePage {
    vibeGallery(where: {id: "cmf0lo9eja9wk07pcwlzw8zdh"}) {
      title
      images(first: 100) {
        image { ...CleanImage }
        altText
      }
    }
    wildlifeGallery(where: {id: "cmf0ovxesabzv07pcvijule37"}) {
      title
      image(first: 100) {
        ... on WildlifePic {
          image { ...CleanImage }
          alt
        }
      }
    }
  }
  ${IMAGE_FRAGMENT}
`;

const CORPORATE_GALLERY_QUERY = `
  query GetCorporateGallery {
    corporateGalleries(orderBy: displayOrder_ASC) {
      id
      title
      caption
      altText
      displayOrder
      image { ...CleanImage }
    }
  }
  ${IMAGE_FRAGMENT}
`;

const SAFARI_GALLERY_QUERY = `
  query GetSafariGallery {
    safarisGalleries{
      id
      safariImages(first: 100)  { ...CleanImage }
    }
  }
  ${IMAGE_FRAGMENT}
`;

const SAFARI_OVERVIEW_QUERY = `
  query GetSafariOverview {
    safaris(
      where: { isActive: true }
      orderBy: sortOrder_ASC
    ) {
      id
      title
      subtitle
      description
      image { ...CleanImage }
      altText
      duration
      isActive
      sortOrder
    }
  }
  ${IMAGE_FRAGMENT}
`;

const SPECIAL_DEAL_QUERY = `
  query GetSpecialDeal {
    specialRoomsDeals(orderBy: createdAt_DESC, first: 1) {
      deal { html }
      validFrom
      validTo
    }
  }
`;

// Simple error handler
const handleError = (error, operation) => {
  console.error(`API Error in ${operation}:`, error);
  throw error;
};

// Date range checker
const isDateInRange = (now, validFrom, validTo) => {
  const from = validFrom ? new Date(validFrom) : null;
  const to = validTo ? new Date(validTo) : null;

  if (from && to) return now >= from && now <= to;
  if (from && !to) return now >= from;
  if (!from && to) return now <= to;
  return true;
};

// CLEAN API FUNCTIONS - Just fetch and filter

export const fetchHeroSlides = async () => {
  try {
    const data = await request(HYGRAPH_URL, HERO_QUERY);
    return data.heroSlides
      .filter((slide) => slide.active)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  } catch (error) {
    handleError(error, "fetchHeroSlides");
  }
};

export const fetchSubHero = async () => {
  try {
    const data = await request(HYGRAPH_URL, SUB_HERO_QUERY);
    return data.subHeroSections[0] || null;
  } catch (error) {
    handleError(error, "fetchSubHero");
  }
};

export const fetchRooms = async () => {
  try {
    const data = await request(HYGRAPH_URL, ROOMS_QUERY);
    return data.rooms;
  } catch (error) {
    handleError(error, "fetchRooms");
  }
};

export const fetchRoomBySlug = async (slug) => {
  try {
    const data = await request(HYGRAPH_URL, ROOM_BY_SLUG_QUERY, { slug });
    return data.rooms?.[0] || null;
  } catch (error) {
    handleError(error, "fetchRoomBySlug");
  }
};

export const fetchServices = async () => {
  try {
    const data = await request(HYGRAPH_URL, SERVICES_QUERY);
    return data.experienceSections[0] || null;
  } catch (error) {
    handleError(error, "fetchServices");
  }
};

export const fetchSafariExperiences = async () => {
  try {
    const data = await request(HYGRAPH_URL, SAFARI_QUERY);
    return data.safaris
      .filter((safari) => safari.isActive)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  } catch (error) {
    handleError(error, "fetchSafariExperiences");
  }
};

export const fetchDining = async () => {
  try {
    const data = await request(HYGRAPH_URL, DINING_QUERY);
    return data.restaurants;
  } catch (error) {
    handleError(error, "fetchDining");
  }
};

export const fetchDiningBySlug = async (slug) => {
  try {
    const data = await request(HYGRAPH_URL, DINING_BY_SLUG_QUERY, {
      url: slug,
    });
    return data.restaurants?.[0] || null;
  } catch (error) {
    handleError(error, "fetchDiningBySlug");
  }
};

export const fetchAboutPage = async () => {
  try {
    const data = await request(HYGRAPH_URL, ABOUT_PAGE_QUERY);

    const aboutPage = data.aboutPage || null;
    const vibeGallery = data.vibeGallery || { images: [] };
    const guestGallery = data.guestGallery?.[0] || { images: [] };

    return { aboutPage, vibeGallery, guestGallery };
  } catch (error) {
    handleError(error, "fetchAboutPage");
  }
};

export const fetchVibePage = async () => {
  try {
    const data = await request(HYGRAPH_URL, VIBE_PAGE_QUERY);

    const vibeImages = data.vibeGallery?.images || [];
    const wildlifeImages = data.wildlifeGallery?.image || [];

    return { vibeImages, wildlifeImages };
  } catch (error) {
    handleError(error, "fetchVibePage");
  }
};

export const fetchCorporateGallery = async () => {
  try {
    const data = await request(HYGRAPH_URL, CORPORATE_GALLERY_QUERY);
    return data.corporateGalleries;
  } catch (error) {
    handleError(error, "fetchCorporateGallery");
  }
};

export const fetchSafariGallery = async () => {
  try {
    const data = await request(HYGRAPH_URL, SAFARI_GALLERY_QUERY);
    return data.safarisGalleries?.[0]?.safariImages || []; // ✅ Fixed: safarisGalleries
  } catch (error) {
    handleError(error, "fetchSafariGallery");
  }
};

export const fetchSafariOverview = async () => {
  try {
    const data = await request(HYGRAPH_URL, SAFARI_OVERVIEW_QUERY);
    return data.safaris;
  } catch (error) {
    handleError(error, "fetchSafariOverview");
  }
};

export const fetchSpecialDeal = async () => {
  try {
    const data = await request(HYGRAPH_URL, SPECIAL_DEAL_QUERY);
    const deal = data.specialRoomsDeals[0];

    if (!deal?.deal) return null;

    const now = new Date();
    return isDateInRange(now, deal.validFrom, deal.validTo) ? deal.deal : null;
  } catch (error) {
    handleError(error, "fetchSpecialDeal");
  }
};

export const fetchHomepageData = async () => {
  try {
    const [heroes, subHero, rooms, services, specialDeal] = await Promise.all([
      fetchHeroSlides(),
      fetchSubHero(),
      fetchRooms(),
      fetchServices(),
      fetchSpecialDeal(),
    ]);

    return { heroes, subHero, rooms, services, specialDeal };
  } catch (error) {
    handleError(error, "fetchHomepageData");
  }
};
