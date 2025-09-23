import { request } from 'graphql-request';

const HYGRAPH_URL = 'https://ap-south-1.cdn.hygraph.com/content/cmek3o66w01vb07w64qwgkybp/master';

// Enhanced image fragment with metadata context
const IMAGE_FRAGMENT = `
  fragment CleanImage on Asset {
    id
    url
    width
    height
    fileName
  }
`;

// HERO QUERY - Enhanced with context
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

// ROOMS QUERY - Enhanced with context
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

// ROOM BY SLUG - Enhanced with context
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

// DINING QUERY - Enhanced with context
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

// DINING BY SLUG - Enhanced with context
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

// SUB HERO QUERY - Enhanced with context
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

// SERVICES QUERY - Enhanced with context
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

// ABOUT PAGE QUERY - Enhanced with context
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

// VIBE PAGE QUERY - Enhanced with context
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

// CORPORATE GALLERY QUERY - Enhanced with context
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

// SPECIAL DEAL QUERY - No images
const SPECIAL_DEAL_QUERY = `
  query GetSpecialDeal {
    specialRoomsDeals(orderBy: createdAt_DESC, first: 1) {
      deal { html }
      validFrom
      validTo
    }
  }
`;

// Enhanced Image Processing - Context-Aware
class ImageContextProcessor {
  /**
   * Processes a raw image with context metadata for intelligent naming
   */
  static processImage(rawImage, context = {}) {
    if (!rawImage?.url) return null;

    const {
      pageType = 'general',           // rooms, dining, vibe, wildlife, corporate, about, hero
      contentName = '',               // room name, restaurant name, etc.
      imageType = 'gallery',          // hero, gallery, logo, thumbnail, feature
      caption = '',                   // existing caption/alt text
      index = null,                   // position in gallery
      customAlt = '',                 // override alt text
      priority = false                // loading priority
    } = context;

    return {
      // Original data
      id: rawImage.id,
      url: rawImage.url,
      width: rawImage.width,
      height: rawImage.height,
      fileName: rawImage.fileName,
      
      // Enhanced metadata for intelligent processing
      context: {
        pageType,
        contentName,
        imageType,
        caption,
        index,
        priority
      },
      
      // Generated alt text (will be enhanced by ImageService)
      alt: customAlt || caption || this.generateSmartAlt(pageType, contentName, imageType, index),
      
      // Loading strategy
      loading: priority ? 'eager' : 'lazy',
      
      // Processed flag
      isProcessed: true
    };
  }

  /**
   * Generates intelligent alt text when none exists
   */
  static generateSmartAlt(pageType, contentName, imageType, index) {
    const altParts = [];
    
    if (contentName) altParts.push(contentName);
    
    const typeDescriptors = {
      hero: 'luxury safari accommodation hero view',
      gallery: 'premium resort experience',
      logo: 'restaurant logo',
      thumbnail: 'facility preview',
      feature: 'amenity highlight'
    };
    
    const pageDescriptors = {
      rooms: 'luxury safari room',
      dining: 'resort dining experience', 
      vibe: 'Limban resort atmosphere',
      wildlife: 'Tadoba wildlife experience',
      corporate: 'business facilities',
      about: 'resort story and team'
    };

    altParts.push(typeDescriptors[imageType] || pageDescriptors[pageType] || 'Limban Resort');
    
    if (typeof index === 'number') altParts.push(`view ${index + 1}`);
    
    return altParts.join(' ');
  }
}

// Error handler
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

// ENHANCED API FUNCTIONS WITH CONTEXT PROCESSING

export const fetchHeroSlides = async () => {
  try {
    const data = await request(HYGRAPH_URL, HERO_QUERY);
    return data.heroSlides
      .filter(slide => slide.active)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
      .map((slide, index) => ({
        ...slide,
        backgroundImage: ImageContextProcessor.processImage(slide.backgroundImage, {
          pageType: 'hero',
          contentName: slide.slideTitle,
          imageType: 'hero',
          index,
          priority: index === 0
        })
      }));
  } catch (error) {
    handleError(error, 'fetchHeroSlides');
  }
};

export const fetchSubHero = async () => {
  try {
    const data = await request(HYGRAPH_URL, SUB_HERO_QUERY);
    const subHero = data.subHeroSections[0];
    if (!subHero) return null;

    return {
      ...subHero,
      image: ImageContextProcessor.processImage(subHero.image, {
        pageType: 'about',
        contentName: subHero.title,
        imageType: 'hero',
        caption: subHero.imageAltText,
        priority: true
      })
    };
  } catch (error) {
    handleError(error, 'fetchSubHero');
  }
};

export const fetchRooms = async () => {
  try {
    const data = await request(HYGRAPH_URL, ROOMS_QUERY);
    return data.rooms.map(room => ({
      ...room,
      heroImage: ImageContextProcessor.processImage(room.heroImage, {
        pageType: 'rooms',
        contentName: room.roomName,
        imageType: 'hero',
        priority: true
      }),
      gallery: room.gallery.map((item, index) => 
        ImageContextProcessor.processImage(item.image, {
          pageType: 'rooms',
          contentName: room.roomName,
          imageType: 'gallery',
          caption: item.caption,
          index
        })
      ).filter(Boolean)
    }));
  } catch (error) {
    handleError(error, 'fetchRooms');
  }
};

export const fetchRoomBySlug = async (slug) => {
  try {
    const data = await request(HYGRAPH_URL, ROOM_BY_SLUG_QUERY, { slug });
    const room = data.rooms?.[0];
    if (!room) return null;

    return {
      ...room,
      heroImage: ImageContextProcessor.processImage(room.heroImage, {
        pageType: 'rooms',
        contentName: room.roomName,
        imageType: 'hero',
        priority: true
      }),
      gallery: room.gallery.map((item, index) => 
        ImageContextProcessor.processImage(item.image, {
          pageType: 'rooms',
          contentName: room.roomName,
          imageType: 'gallery',
          caption: item.caption,
          index
        })
      ).filter(Boolean)
    };
  } catch (error) {
    handleError(error, 'fetchRoomBySlug');
  }
};

export const fetchServices = async () => {
  try {
    const data = await request(HYGRAPH_URL, SERVICES_QUERY);
    const services = data.experienceSections[0];
    if (!services) return null;

    return {
      ...services,
      experience: services.experience.map((exp, index) => ({
        ...exp,
        image: ImageContextProcessor.processImage(exp.image, {
          pageType: 'experiences',
          contentName: exp.title,
          imageType: 'feature',
          caption: exp.imageAltText,
          index
        })
      }))
    };
  } catch (error) {
    handleError(error, 'fetchServices');
  }
};

export const fetchDining = async () => {
  try {
    const data = await request(HYGRAPH_URL, DINING_QUERY);
    return data.restaurants.map(restaurant => ({
      ...restaurant,
      logo: ImageContextProcessor.processImage(restaurant.logo, {
        pageType: 'dining',
        contentName: restaurant.restaurantName,
        imageType: 'logo'
      }),
      images: restaurant.images.map((img, index) => 
        ImageContextProcessor.processImage(img, {
          pageType: 'dining',
          contentName: restaurant.restaurantName,
          imageType: 'gallery',
          index
        })
      ).filter(Boolean)
    }));
  } catch (error) {
    handleError(error, 'fetchDining');
  }
};

export const fetchDiningBySlug = async (slug) => {
  try {
    const data = await request(HYGRAPH_URL, DINING_BY_SLUG_QUERY, { url: slug });
    const restaurant = data.restaurants?.[0];
    if (!restaurant) return null;

    return {
      ...restaurant,
      logo: ImageContextProcessor.processImage(restaurant.logo, {
        pageType: 'dining',
        contentName: restaurant.restaurantName,
        imageType: 'logo'
      }),
      images: restaurant.images.map((img, index) => 
        ImageContextProcessor.processImage(img, {
          pageType: 'dining',
          contentName: restaurant.restaurantName,
          imageType: 'gallery',
          index
        })
      ).filter(Boolean)
    };
  } catch (error) {
    handleError(error, 'fetchDiningBySlug');
  }
};

export const fetchAboutPage = async () => {
  try {
    const data = await request(HYGRAPH_URL, ABOUT_PAGE_QUERY);
    
    const aboutPage = data.aboutPage ? {
      ...data.aboutPage,
      heroImage: ImageContextProcessor.processImage(data.aboutPage.heroImage, {
        pageType: 'about',
        imageType: 'hero',
        contentName: 'Limban Resort Story',
        priority: true
      }),
      philosophyImage: ImageContextProcessor.processImage(data.aboutPage.philosophyImage, {
        pageType: 'about',
        imageType: 'feature',
        contentName: 'Resort Philosophy'
      }),
      foundersImage: ImageContextProcessor.processImage(data.aboutPage.foundersImage, {
        pageType: 'about',
        imageType: 'feature',
        contentName: 'Founders Story'
      }),
      // FIX: Add null check
      teamImages: (data.aboutPage.teamImages || []).map((img, index) => 
        ImageContextProcessor.processImage(img, {
          pageType: 'about',
          imageType: 'team',
          contentName: 'Team Member',
          index
        })
      ).filter(Boolean)
    } : null;

    const vibeGallery = data.vibeGallery ? {
      ...data.vibeGallery,
      images: (data.vibeGallery.images || []).map((item, index) => 
        ImageContextProcessor.processImage(item.image, {
          pageType: 'vibe',
          imageType: 'gallery',
          caption: item.altText,
          contentName: 'Limban Moments',
          index
        })
      ).filter(Boolean)
    } : { images: [] };

    // FIX: Handle guestGallery array structure
    const guestGallery = data.guestGallery && data.guestGallery[0] ? {
      ...data.guestGallery[0],
      images: (data.guestGallery[0].images || []).map((img, index) => 
        ImageContextProcessor.processImage(img, {
          pageType: 'guest',
          imageType: 'gallery',
          contentName: 'Guest Experience',
          index
        })
      ).filter(Boolean)
    } : { images: [] };

    return { aboutPage, vibeGallery, guestGallery };
  } catch (error) {
    handleError(error, 'fetchAboutPage');
  }
};

export const fetchVibePage = async () => {
  try {
    const data = await request(HYGRAPH_URL, VIBE_PAGE_QUERY);
    
    const vibeImages = data.vibeGallery?.images.map((item, index) => 
      ImageContextProcessor.processImage(item.image, {
        pageType: 'vibe',
        imageType: 'gallery',
        caption: item.altText,
        contentName: 'Resort Vibe',
        index
      })
    ).filter(Boolean) || [];

    const wildlifeImages = data.wildlifeGallery?.image.map((item, index) => 
      ImageContextProcessor.processImage(item.image, {
        pageType: 'wildlife',
        imageType: 'gallery',
        caption: item.alt,
        contentName: 'Wildlife Safari',
        index
      })
    ).filter(Boolean) || [];

    return { vibeImages, wildlifeImages };
  } catch (error) {
    handleError(error, 'fetchVibePage');
  }
};

export const fetchCorporateGallery = async () => {
  try {
    const data = await request(HYGRAPH_URL, CORPORATE_GALLERY_QUERY);
    return data.corporateGalleries.map((item, index) => ({
      ...item,
      image: ImageContextProcessor.processImage(item.image, {
        pageType: 'corporate',
        imageType: 'gallery',
        contentName: item.title,
        caption: item.caption || item.altText,
        index
      })
    }));
  } catch (error) {
    handleError(error, 'fetchCorporateGallery');
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
    handleError(error, 'fetchSpecialDeal');
  }
};

// HOMEPAGE DATA - Enhanced with context processing
export const fetchHomepageData = async () => {
  try {
    const [heroes, subHero, rooms, services, specialDeal] = await Promise.all([
      fetchHeroSlides(),
      fetchSubHero(), 
      fetchRooms(),
      fetchServices(),
      fetchSpecialDeal()
    ]);
    
    return { heroes, subHero, rooms, services, specialDeal };
  } catch (error) {
    handleError(error, 'fetchHomepageData');
  }
};
