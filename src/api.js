import { request } from 'graphql-request';

// Configuration
const HYGRAPH_URL = 'https://ap-south-1.cdn.hygraph.com/content/cmek3o66w01vb07w64qwgkybp/master';

// Reusable Fragments
const IMAGE_FIELDS_FRAGMENT = `
  fragment ImageFields on Asset {
    url
    width
    height
    placeholder: url(transformation: { image: { resize: { width: 20, height: 20, fit: crop }, quality: { value: 20 } }, document: { output: { format: webp } } })
    gallerythumbs: url(transformation: { image: { resize: { width: 92, height: 92, fit: crop }, quality: { value: 60 } }, document: { output: { format: webp } } })
    grid: url(transformation: { image: { resize: { width: 300, height: 300, fit: crop }, quality: { value: 35 } }, document: { output: { format: webp } } })
    thumb400: url(transformation: { image: { resize: { width: 400, height: 400, fit: crop }, quality: { value: 35 } }, document: { output: { format: webp } } })
    large: url(transformation: { image: { resize: { width: 1200, fit: scale }, quality: { value: 70 } }, document: { output: { format: webp } } })
  }
`;

// ============ QUERIES ============

const HERO_QUERY = `
  query GetHeroSlides {
    heroSlides(where: { active: true }, orderBy: displayOrder_ASC) {
      slideTitle
      subtitle
      backgroundImage { 
        url
        hero4K: url(transformation: { image: { resize: { width: 2560, height: 1440, fit: crop }, quality: { value: 40 } }, document: { output: { format: webp } } })
        heroDesktop: url(transformation: { image: { resize: { width: 1600, height: 900, fit: crop }, quality: { value: 40 } }, document: { output: { format: webp } } })
        heroTablet: url(transformation: { image: { resize: { width: 1024, height: 576, fit: crop }, quality: { value: 40 } }, document: { output: { format: webp } } })
        heroMobile: url(transformation: { image: { resize: { width: 768, height: 432, fit: crop }, quality: { value: 40 } }, document: { output: { format: webp } } })
      }
      ctaText
      ctaLink
      displayOrder
      active
    }
  }
`;

const SUB_HERO_QUERY = `
  query GetSubHeroSections {
    subHeroSections {
      aboveHeader
      title
      imageAltText
      bodyText { html }
      image {
        url(transformation: { image: { resize: { width: 500, height: 600, fit: crop }, quality: { value: 60 } }, document: { output: { format: webp } } })
      }
      stats {
        number
        label
        svg
      }
    }
  }
`;

const ROOMS_QUERY = `
  query GetRoomsOptimized {
    rooms {
      id
      roomName
      url
      shortDescription
      basePrice
      heroImage {
        optimisedCard: url(transformation: { image: { resize: { width: 600, height: 400, fit: crop }, quality: { value: 60 } }, document: { output: { format: webp } } })
      }
      roomFeature(first: 100) {
        id
        featureName
        svgImage
      }
    }
  }
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
      heroImage {
        optimisedCard: url(transformation: { image: { resize: { width: 600, fit: crop }, quality: { value: 60 } }, document: { output: { format: webp } } })
      }
      gallery(first: 100) {
        __typename
        ... on RoomGalleryItem {
          id
          image { ...ImageFields }
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
  ${IMAGE_FIELDS_FRAGMENT}
`;

const EXPERIENCE_QUERY = `
  query GetExperienceSections {
    experienceSections {
      aboveHeader
      title
      description
      experience {
        image {
          url(transformation: { image: { resize: { width: 350, height: 150, fit: crop }, quality: { value: 60 } }, document: { output: { format: webp } } })
        }
        imageAltText
        title
        description
        link
        buttonText
        feature { text }
      }
    }
  }
`;

const SPECIAL_DEAL_QUERY = `
  query GetSpecialRoomsDeal {
    specialRoomsDeals(orderBy: createdAt_DESC, first: 1) {
      deal { html }
      validFrom
      validTo
    }
  }
`;

const ABOUT_PAGE_QUERY = `
  query AboutData {
    aboutPage(where: {id: "cmeyayyex8xsc07pc8u9cgfxq"}) {
      heroImage {
        url
        optimisedCard: url(transformation: { image: { resize: { width: 2000, height: 1200, fit: crop }, quality: { value: 60 } }, document: { output: { format: webp } } })
      }
      philosophyImage {
        url
        optimisedWide: url(transformation: { image: { resize: { width: 1200, height: 800, fit: crop }, quality: { value: 60 } }, document: { output: { format: webp } } })
      }
      foundersImage {
        url
        optimisedPortrait: url(transformation: { image: { resize: { width: 1000, height: 1000, fit: crop }, quality: { value: 60 } }, document: { output: { format: webp } } })
      }
      teamImages(first: 100) {
        url
        optimisedSquare: url(transformation: { image: { resize: { width: 400, height: 400, fit: crop }, quality: { value: 60 } }, document: { output: { format: webp } } })
      }
    }
    vibeGallery(where: {id: "cmf0lo9eja9wk07pcwlzw8zdh"}) {
      title
      images(first: 100) {
        image { ...ImageFields }
        altText
      }
    }
    guestGallery: guestGalleries(first: 1) {
      images(first: 500) { ...ImageFields }
    }
  }
  ${IMAGE_FIELDS_FRAGMENT}
`;

const VIBE_PAGE_QUERY = `
  query VibePageData {
    vibeGallery(where: {id: "cmf0lo9eja9wk07pcwlzw8zdh"}) {
      title
      images(first: 100) {
        image { ...ImageFields }
        altText
      }
    }
    wildlifeGallery(where: {id: "cmf0ovxesabzv07pcvijule37"}) {
      title
      image(first: 100) {
        ... on WildlifePic {
          image { ...ImageFields }
          alt
        }
      }
    }
  }
  ${IMAGE_FIELDS_FRAGMENT}
`;

const DINING_EXPERIENCES_QUERY = `
  query DiningExperiences {
    restaurants(first: 100) {
      id
      restaurantName
      url
      logo {
        url
        width
        height
        optimisedLogo: url(transformation: { image: { resize: { width: 80, height: 80, fit: crop }, quality: { value: 70 } }, document: { output: { format: webp } } })
      }
      shortIntro
      longDescription
      images(first: 100) {
        url
        width
        height
        grid: url(transformation: { image: { resize: { width: 300, height: 300, fit: crop }, quality: { value: 35 } }, document: { output: { format: webp } } })
        thumb400: url(transformation: { image: { resize: { width: 400, height: 400, fit: crop }, quality: { value: 35 } }, document: { output: { format: webp } } })
        large: url(transformation: { image: { resize: { width: 1200, fit: scale }, quality: { value: 70 } }, document: { output: { format: webp } } })
        placeholder: url(transformation: { image: { resize: { width: 20, height: 20, fit: crop }, quality: { value: 20 } }, document: { output: { format: webp } } })
      }
    }
  }
`;

const DINING_BY_SLUG_QUERY = `
  query DiningExperienceBySlug($url: String!) {
    restaurants(where: { url: $url }, first: 1) {
      id
      restaurantName
      url
      shortIntro
      longDescription
      logo {
        url
        micro: url(transformation: { image: { resize: { width: 40, height: 40, fit: crop }, quality: { value: 25 } }, document: { output: { format: webp } } })
        optimised: url(transformation: { image: { resize: { width: 120, height: 120, fit: crop }, quality: { value: 35 } }, document: { output: { format: webp } } })
      }
      images(first: 20) { ...ImageFields }
    }
  }
  ${IMAGE_FIELDS_FRAGMENT}
`;


const CORPORATE_GALLERY_QUERY = `
  query CorporateGalleryQuery {
    corporateGalleries(orderBy: displayOrder_ASC) {
      id
      title
      caption
      altText
      displayOrder
      image {
        url(transformation: { image: { resize: { width: 400, height: 400, fit: crop }, quality: { value: 40 } }, document: { output: { format: webp } } })
        id
        width
        height
      }
    }
  }
`;

// ============ UTILITIES ============

// Enhanced error handler with context
const handleApiError = (error, operation) => {
  console.error(`Hygraph API error in ${operation}:`, error);
  throw error;
};

// Date validation for special deals
const isDateInRange = (now, validFrom, validTo) => {
  const from = validFrom ? new Date(validFrom) : null;
  const to = validTo ? new Date(validTo) : null;
  
  if (from && to) return now >= from && now <= to;
  if (from && !to) return now >= from;
  if (!from && to) return now <= to;
  return true; // No dates set = always active
};

// ============ API FUNCTIONS ============

export const fetchHeroData = async () => {
  try {
    const data = await request(HYGRAPH_URL, HERO_QUERY);
    return data.heroSlides
      .filter(slide => slide.active)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  } catch (error) {
    handleApiError(error, 'fetchHeroData');
  }
};

export const fetchSubHeroData = async () => {
  try {
    const data = await request(HYGRAPH_URL, SUB_HERO_QUERY);
    return data.subHeroSections[0] || null;
  } catch (error) {
    handleApiError(error, 'fetchSubHeroData');
  }
};

export const fetchRoomsData = async () => {
  try {
    const data = await request(HYGRAPH_URL, ROOMS_QUERY);
    return data.rooms;
  } catch (error) {
    handleApiError(error, 'fetchRoomsData');
  }
};

export const fetchRoomBySlug = async (slug) => {
  try {
    const data = await request(HYGRAPH_URL, ROOM_BY_SLUG_QUERY, { slug });
    return data.rooms.length > 0 ? data.rooms[0] : null;
  } catch (error) {
    handleApiError(error, 'fetchRoomBySlug');
  }
};

export const fetchExperienceData = async () => {
  try {
    const data = await request(HYGRAPH_URL, EXPERIENCE_QUERY);
    return data.experienceSections[0] || null;
  } catch (error) {
    handleApiError(error, 'fetchExperienceData');
  }
};

export const fetchSpecialDealData = async () => {
  try {
    const data = await request(HYGRAPH_URL, SPECIAL_DEAL_QUERY);
    const latestDeal = data.specialRoomsDeals[0];
    
    if (!latestDeal?.deal) return null;
    
    const now = new Date();
    return isDateInRange(now, latestDeal.validFrom, latestDeal.validTo) 
      ? latestDeal.deal 
      : null;
  } catch (error) {
    handleApiError(error, 'fetchSpecialDealData');
  }
};

export const fetchAboutData = async () => {
  try {
    const data = await request(HYGRAPH_URL, ABOUT_PAGE_QUERY);
    return {
      aboutPage: data.aboutPage,
      vibeGallery: data.vibeGallery,
      guestGallery: data.guestGallery?.[0] || null
    };
  } catch (error) {
    handleApiError(error, 'fetchAboutData');
  }
};

export const fetchVibePageData = async () => {
  try {
    const data = await request(HYGRAPH_URL, VIBE_PAGE_QUERY);
    return {
      vibeImages: data.vibeGallery?.images || [],
      wildlifeImages: data.wildlifeGallery?.image || []
    };
  } catch (error) {
    handleApiError(error, 'fetchVibePageData');
  }
};

export const fetchDiningExperiencesData = async () => {
  try {
    const data = await request(HYGRAPH_URL, DINING_EXPERIENCES_QUERY);
    return data.restaurants;
  } catch (error) {
    handleApiError(error, 'fetchDiningExperiencesData');
  }
};

export const fetchDiningExperienceBySlug = async (slug) => {
  try {
    const data = await request(HYGRAPH_URL, DINING_BY_SLUG_QUERY, { url: slug });
    return data.restaurants?.[0];
  } catch (error) {
    handleApiError(error, 'fetchDiningExperienceBySlug');
  }
};

export const fetchCorporateGallery = async () => {
  try {
    const data = await request(HYGRAPH_URL, CORPORATE_GALLERY_QUERY);
    return data.corporateGalleries || [];
  } catch (error) {
    handleApiError(error, 'fetchCorporateGallery');
  }
};

// Combined data fetchers
export const fetchAllHomepageData = async () => {
  try {
    const [heroes, subHero, rooms, experiences, specialDeal] = await Promise.all([
      fetchHeroData(),
      fetchSubHeroData(),
      fetchRoomsData(),
      fetchExperienceData(),
      fetchSpecialDealData()
    ]);
    return { heroes, subHero, rooms, experiences, specialDeal };
  } catch (error) {
    handleApiError(error, 'fetchAllHomepageData');
  }
};
