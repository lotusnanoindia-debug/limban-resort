// api-optimized.js
import { request } from 'graphql-request';

const HYGRAPH_URL = 'https://ap-south-1.cdn.hygraph.com/content/cmek3o66w01vb07w64qwgkybp/master';

// ✅ NEW: Single query for homepage performance
const HOMEPAGE_DATA_OPTIMIZED_QUERY = `
  query GetAllHomepageDataOptimized {
    heroSlides(where: { active: true }, orderBy: displayOrder_ASC) {
      id
      slideTitle
      subtitle
      ctaText
      ctaLink
      displayOrder
      active
      backgroundImage {
        id
        fileName
        url
      }
    }
    subHeroSections {
      id
      aboveHeader
      title
      imageAltText
      bodyText { html }
      subHeroImage: image {
        id
        fileName
        url
      }
      stats {
        number
        label
        svg
      }
    }
    rooms {
      id
      roomName
      url
      shortDescription
      basePrice
      heroImage {
        id
        fileName
        url
      }
      roomFeature(first: 100) {
        id
        featureName
        svgImage
      }
    }
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
        image {
          id
          fileName
          url
        }
        feature { text }
      }
    }
    specialRoomsDeals(orderBy: createdAt_DESC, first: 1) {
      deal { html }
      validFrom
      validTo
    }
  }
`;

// 🔥 EXISTING: Reusable Fragments
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

const HERO_OPTIMIZED_QUERY = `
  query GetHeroOptimized {
    heroSlides(where: { active: true }, orderBy: displayOrder_ASC) {
      id
      slideTitle
      subtitle
      ctaText
      ctaLink
      displayOrder
      active
      backgroundImage {
        id
        fileName
        url
      }
    }
  }
`;

const SUB_HERO_OPTIMIZED_QUERY = `
  query GetSubHeroOptimized {
    subHeroSections {
      id
      aboveHeader
      title
      imageAltText
      bodyText { html }
      subHeroImage: image {
        id
        fileName
        url
      }
      stats {
        number
        label
        svg
      }
    }
  }
`;

const ROOMS_OPTIMIZED_QUERY = `
  query GetRoomsOptimized {
    rooms {
      id
      roomName
      url
      shortDescription
      basePrice
      heroImage {
        id
        fileName
        url
      }
      roomFeature(first: 100) {
        id
        featureName
        svgImage
      }
    }
  }
`;

const ROOM_BY_SLUG_OPTIMIZED_QUERY = `
  query GetRoomBySlugOptimized($slug: String!) {
    rooms(where: { url: $slug }, first: 1) {
      id
      roomName
      url
      shortDescription
      description { html }
      basePrice
      heroImage {
        id
        fileName
        url
      }
      gallery(first: 100) {
        __typename
        ... on RoomGalleryItem {
          id
          image {
            id
            fileName
            url
          }
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
`;

const SERVICES_OPTIMIZED_QUERY = `
  query GetServicesOptimized {
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
        image {
          id
          fileName
          url
        }
        feature { text }
      }
    }
  }
`;

const ABOUT_PAGE_OPTIMIZED_QUERY = `
  query AboutDataOptimized {
    aboutPage(where: {id: "cmeyayyex8xsc07pc8u9cgfxq"}) {
      heroImage {
        id
        fileName
        url
      }
      philosophyImage {
        id
        fileName
        url
      }
      foundersImage {
        id
        fileName
        url
      }
      teamImages(first: 100) {
        id
        fileName
        url
      }
    }
    vibeGallery(where: {id: "cmf0lo9eja9wk07pcwlzw8zdh"}) {
      title
      images(first: 100) {
        image {
          id
          fileName
          url
        }
        altText
      }
    }
    guestGallery: guestGalleries(first: 1) {
      images(first: 500) {
        id
        fileName
        url
      }
    }
  }
`;

const VIBE_PAGE_OPTIMIZED_QUERY = `
  query VibePageDataOptimized {
    vibeGallery(where: {id: "cmf0lo9eja9wk07pcwlzw8zdh"}) {
      title
      images(first: 100) {
        image {
          id
          fileName
          url
        }
        altText
      }
    }
    wildlifeGallery(where: {id: "cmf0ovxesabzv07pcvijule37"}) {
      title
      image(first: 100) {
        ... on WildlifePic {
          image {
            id
            fileName
            url
          }
          alt
        }
      }
    }
  }
`;

const DINING_EXPERIENCES_OPTIMIZED_QUERY = `
  query DiningExperiencesOptimized {
    restaurants(first: 100) {
      id
      restaurantName
      url
      shortIntro
      longDescription
      logo {
        id
        fileName
        url
      }
      images(first: 100) {
        id
        fileName
        url
      }
    }
  }
`;

const DINING_BY_SLUG_OPTIMIZED_QUERY = `
  query DiningExperienceBySlugOptimized($url: String!) {
    restaurants(where: { url: $url }, first: 1) {
      id
      restaurantName
      url
      shortIntro
      longDescription
      logo {
        id
        fileName
        url
      }
      images(first: 20) {
        id
        fileName
        url
      }
    }
  }
`;

const CORPORATE_GALLERY_OPTIMIZED_QUERY = `
  query CorporateGalleryOptimized {
    corporateGalleries(orderBy: displayOrder_ASC) {
      id
      title
      caption
      altText
      displayOrder
      image {
        id
        fileName
        url
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

const handleApiError = (error, operation) => {
  console.error(`Hygraph API error in ${operation}:`, error);
  throw error;
};

const isDateInRange = (now, validFrom, validTo) => {
  if (!validFrom && !validTo) return true;
  if (!validFrom) return now.getTime() <= new Date(validTo).getTime();
  if (!validTo) return now.getTime() >= new Date(validFrom).getTime();
  return now.getTime() >= new Date(validFrom).getTime() && now.getTime() <= new Date(validTo).getTime();
};

export const fetchSpecialDealData = async () => {
  try {
    const data = await request(HYGRAPH_URL, SPECIAL_DEAL_QUERY);
    const latestDeal = data.specialRoomsDeals[0];
    
    if (!latestDeal?.deal) return null;
    
    const now = new Date();
    const isValid = isDateInRange(now, latestDeal.validFrom, latestDeal.validTo);
    return isValid ? latestDeal.deal : null;
  } catch (error) {
    handleApiError(error, 'fetchSpecialDealData');
  }
};

// ✅ UPDATED: Now uses single query for performance
export const fetchAllHomepageDataOptimized = async () => {
  try {
    const data = await request(HYGRAPH_URL, HOMEPAGE_DATA_OPTIMIZED_QUERY);
    
    // Process special deal
    const latestDeal = data.specialRoomsDeals[0];
    let specialDeal = null;
    
    if (latestDeal?.deal) {
      const now = new Date();
      const isValid = isDateInRange(now, latestDeal.validFrom, latestDeal.validTo);
      specialDeal = isValid ? latestDeal.deal : null;
    }

    return {
      heroes: data.heroSlides || [],
      subHero: data.subHeroSections?.[0] || null,
      rooms: data.rooms || [],
      experiences: data.experienceSections?.[0] || null,
      specialDeal
    };
  } catch (error) {
    handleApiError(error, 'fetchAllHomepageDataOptimized');
  }
};

export const fetchHeroDataOptimized = async () => {
  try {
    const data = await request(HYGRAPH_URL, HERO_OPTIMIZED_QUERY);
    return data.heroSlides
      .filter(slide => slide.active)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  } catch (error) {
    handleApiError(error, 'fetchHeroDataOptimized');
  }
};

export const fetchSubHeroDataOptimized = async () => {
  try {
    const data = await request(HYGRAPH_URL, SUB_HERO_OPTIMIZED_QUERY);
    return data.subHeroSections[0] || null;
  } catch (error) {
    handleApiError(error, 'fetchSubHeroDataOptimized');
  }
};

export const fetchRoomsDataOptimized = async () => {
  try {
    const data = await request(HYGRAPH_URL, ROOMS_OPTIMIZED_QUERY);
    return data.rooms;
  } catch (error) {
    handleApiError(error, 'fetchRoomsDataOptimized');
  }
};

export const fetchRoomBySlugOptimized = async (slug) => {
  try {
    const data = await request(HYGRAPH_URL, ROOM_BY_SLUG_OPTIMIZED_QUERY, { slug });
    return data.rooms.length > 0 ? data.rooms[0] : null;
  } catch (error) {
    handleApiError(error, 'fetchRoomBySlugOptimized');
  }
};

export const fetchExperienceDataOptimized = async () => {
  try {
    const data = await request(HYGRAPH_URL, SERVICES_OPTIMIZED_QUERY);
    return data.experienceSections[0] || null;
  } catch (error) {
    handleApiError(error, 'fetchExperienceDataOptimized');
  }
};

export const fetchAboutDataOptimized = async () => {
  try {
    const data = await request(HYGRAPH_URL, ABOUT_PAGE_OPTIMIZED_QUERY);
    return {
      aboutPage: data.aboutPage,
      vibeGallery: data.vibeGallery,
      guestGallery: data.guestGallery?.[0] || null
    };
  } catch (error) {
    handleApiError(error, 'fetchAboutDataOptimized');
  }
};

export const fetchVibePageDataOptimized = async () => {
  try {
    const data = await request(HYGRAPH_URL, VIBE_PAGE_OPTIMIZED_QUERY);
    return {
      vibeImages: data.vibeGallery?.images || [],
      wildlifeImages: data.wildlifeGallery?.image || []
    };
  } catch (error) {
    handleApiError(error, 'fetchVibePageDataOptimized');
  }
};

export const fetchDiningExperiencesDataOptimized = async () => {
  try {
    const data = await request(HYGRAPH_URL, DINING_EXPERIENCES_OPTIMIZED_QUERY);
    return data.restaurants;
  } catch (error) {
    handleApiError(error, 'fetchDiningExperiencesDataOptimized');
  }
};

export const fetchDiningExperienceBySlugOptimized = async (slug) => {
  try {
    const data = await request(HYGRAPH_URL, DINING_BY_SLUG_OPTIMIZED_QUERY, { url: slug });
    return data.restaurants?.[0];
  } catch (error) {
    handleApiError(error, 'fetchDiningExperienceBySlugOptimized');
  }
};

export const fetchCorporateGalleryOptimized = async () => {
  try {
    const data = await request(HYGRAPH_URL, CORPORATE_GALLERY_OPTIMIZED_QUERY);
    return data.corporateGalleries || [];
  } catch (error) {
    handleApiError(error, 'fetchCorporateGalleryOptimized');
  }
};

// Legacy aliases
export const getHeroOptimized = fetchHeroDataOptimized;
export const getSubHeroOptimized = fetchSubHeroDataOptimized;
export const getRoomsOptimized = fetchRoomsDataOptimized;
export const getServicesOptimized = fetchExperienceDataOptimized;
