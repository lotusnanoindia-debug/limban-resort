import { request } from 'graphql-request';

// Your exact Hygraph endpoint from PHP
const HYGRAPH_URL = 'https://ap-south-1.cdn.hygraph.com/content/cmek3o66w01vb07w64qwgkybp/master';

const IMAGE_FIELDS_FRAGMENT = `
  fragment ImageFields on Asset {
    url
    width
    height
    placeholder: url(transformation: { image: { resize: { width: 20, height: 20, fit: crop }, quality: { value: 20 } }, document: { output: { format: webp } } })
    thumb400: url(transformation: { image: { resize: { width: 400, height: 400, fit: crop }, quality: { value: 65 } }, document: { output: { format: webp } } })
    thumb800: url(transformation: { image: { resize: { width: 800, height: 800, fit: crop }, quality: { value: 60 } }, document: { output: { format: webp } } })
    large: url(transformation: { image: { resize: { width: 1920, fit: scale }, quality: { value: 80 } }, document: { output: { format: webp } } })
  }
`;

// Hero query - exactly matching your PHP
const HERO_QUERY = `
  query GetHeroSlides {
    heroSlides {
      slideTitle
      subtitle
      backgroundImage { 
        url
        hero4K: url(transformation: {
          image: { resize: { width: 2560, height: 1440, fit: crop } }
          document: { output: { format: webp } }
        })
        heroDesktop: url(transformation: {
          image: { resize: { width: 1600, height: 900, fit: crop } }
          document: { output: { format: webp } }
        })
        heroTablet: url(transformation: {
          image: { resize: { width: 1024, height: 576, fit: crop } }
          document: { output: { format: webp} }
        })
        heroMobile: url(transformation: {
          image: { resize: { width: 768, height: 432, fit: crop } }
          document: { output: { format: webp } }
        })
      }
      ctaText
      ctaLink
      displayOrder
      active
    }
  }
`;

// Sub hero query - exactly matching your PHP
const SUB_HERO_QUERY = `
  query GetSubHeroSections {
    subHeroSections {
      aboveHeader
      title
      imageAltText
      bodyText {
        html
      }
      image {
        url(
          transformation: {
            image: {
              resize: {width: 600, height: 600, fit: crop}, 
              quality: {value: 60}
            }, 
            document: {output: {format: webp}}
          }
        )
      }
      stats {
        number
        label
        svg
      }
    }
  }
`;

// Updated Rooms query - optimized without gallery for listing page
const ROOMS_QUERY = `
  query GetRoomsOptimized {
    rooms {
      id
      roomName
      url
      shortDescription
      basePrice
      heroImage {
        optimisedCard: url(
          transformation: {
            image: {
              resize: {width: 500, height: 350, fit: crop}, 
              quality: {value: 70}
            }, 
            document: {output: {format: webp}}
          }
        )
      }
      roomFeature(first: 100) {
        id
        featureName
        svgImage
      }
    }
  }
`;

// New Room by Slug query - with gallery for detail pages
const ROOM_BY_SLUG_QUERY = `
  query GetRoomBySlug($slug: String!) {
    rooms(where: { url: $slug }, first: 1) {
      id
      roomName
      url
      shortDescription
      description {
        html
      }
      basePrice
      heroImage {
        optimisedCard: url(
          transformation: {
            image: {
              resize: {width: 600, fit: crop}, 
              quality: {value: 70}
            }, 
            document: {output: {format: webp}}
          }
        )
      }
      gallery(first: 100) {
        __typename
        ... on RoomGalleryItem {
          id
          image {
            ...ImageFields
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
  ${IMAGE_FIELDS_FRAGMENT}
`;

// Experience query - exactly matching your PHP
const EXPERIENCE_QUERY = `
  query GetExperienceSections {
    experienceSections {
      aboveHeader
      title
      description
      experience {
        image {
          url(
            transformation: {
              image: { 
                resize: { width: 400, height: 256, fit: crop }
              }
              document: { output: { format: webp } }
            }
          )
        }
        imageAltText
        title
        description
        link
        feature {
          text
        }
      }
    }
  }
`;


export async function fetchAboutData() {
  const query = `
    query AboutData {
      aboutPage(where: {id: "cmeyayyex8xsc07pc8u9cgfxq"}) {
        heroImage {
          url
          optimisedCard: url(transformation: {
            image: { 
              resize: { width: 2000, height: 1200, fit: crop },
              quality: { value: 60 }
            },
            document: { output: { format: webp } }
          })
        }
        philosophyImage {
          url
          optimisedWide: url(transformation: {
            image: { 
              resize: { width: 1200, height: 800, fit: crop },
              quality: { value: 70 }
            },
            document: { output: { format: webp } }
          })
        }
        foundersImage {
          url
          optimisedPortrait: url(transformation: {
            image: { 
              resize: { width: 1000, height: 1000, fit: crop },
              quality: { value: 65 }
            },
            document: { output: { format: webp } }
          })
        }
        teamImages(first: 100) {
          url
          optimisedSquare: url(transformation: {
            image: { 
              resize: { width: 400, height: 400, fit: crop },
              quality: { value: 70 }
            },
            document: { output: { format: webp } }
          })
        }
      }
      
      # Pull vibe gallery with optimized transforms
      vibeGallery(where: {id: "cmf0lo9eja9wk07pcwlzw8zdh"}) {
        title
        images(first: 100) {
          image {
            ...ImageFields
          }
          altText
        }
      }
    }
    ${IMAGE_FIELDS_FRAGMENT}
  `;

  try {
    const data = await request(HYGRAPH_URL, query);
    return {
      aboutPage: data.aboutPage,
      vibeGallery: data.vibeGallery
    };
  } catch (error) {
    console.error('Error fetching about data:', error);
    throw error;
  }
}



export async function fetchVibePageData() {
  const query = `
    query VibePageData {
      vibeGallery(where: {id: "cmf0lo9eja9wk07pcwlzw8zdh"}) {
        title
        images(first: 100) {
          image {
            ...ImageFields
          }
          altText
        }
      }
      
      wildlifeGallery(where: {id: "cmf0ovxesabzv07pcvijule37"}) {
        title
        image(first: 100) {
          ... on WildlifePic {
            image {
              ...ImageFields
            }
            alt
          }
        }
      }
    }
    ${IMAGE_FIELDS_FRAGMENT}
  `;

  try {
    const data = await request(HYGRAPH_URL, query);
    console.log('Raw Hygraph data:', data); // Debug log
    return {
      vibeImages: data.vibeGallery?.images || [],
      wildlifeImages: data.wildlifeGallery?.image || []
    };
  } catch (error) {
    console.error('Error fetching vibe page data:', error);
    throw error;
  }
}

// In your api.js
export async function fetchDiningExperiencesData() {
  const query = `
    query DiningExperiences {
      restaurants(first: 100) {
        id
        restaurantName
        url
        logo {
          url
          width
          height
          # Optimized logo for cards
          optimisedLogo: url(transformation: {
            image: { 
              resize: { width: 80, height: 80, fit: crop },
              quality: { value: 70 }
            },
            document: { output: { format: webp } }
          })
        }
        shortIntro
        longDescription
        images(first: 100) {
          url
          width
          height
          # Hero image for card
          heroImage: url(transformation: {
            image: { 
              resize: { width: 800, height: 600, fit: crop },
              quality: { value: 70 }
            },
            document: { output: { format: webp } }
          })
          # Thumbnail for grid
          thumbnail: url(transformation: {
            image: { 
              resize: { width: 400, height: 300, fit: crop },
              quality: { value: 65 }
            },
            document: { output: { format: webp } }
          })
          # LQIP placeholder
          placeholder: url(transformation: {
            image: { 
              resize: { width: 20, height: 15, fit: crop },
              quality: { value: 20 }
            },
            document: { output: { format: webp } }
          })
        }
      }
    }
  `;

  try {
    const data = await request(HYGRAPH_URL, query);
    return data.restaurants;
  } catch (error) {
    console.error('Error fetching dining experiences:', error);
    throw error;
  }
}


export async function fetchDiningExperienceBySlug(slug) {
  const query = `
    query DiningExperienceBySlug($url: String!) {
      restaurants(where: { url: $url }, first: 1) {
        id
        restaurantName
        url
        shortIntro
        longDescription
        logo {
          url
          micro: url(transformation: {
            image: { resize: { width: 40, height: 40, fit: crop }, quality: { value: 45 } }
            document: { output: { format: webp } }
          })
          optimised: url(transformation: {
            image: { resize: { width: 120, height: 120, fit: crop }, quality: { value: 70 } }
            document: { output: { format: webp } }
          })
        }
        images(first: 20) {
          ...ImageFields
        }
      }
    }
    ${IMAGE_FIELDS_FRAGMENT}
  `;
  const variables = { url: slug };

  try {
    const data = await request(HYGRAPH_URL, query, variables);
    return data.restaurants?.[0]; // Return first result or undefined
  } catch (error) {
    console.error('Error fetching dining experience by slug:', error);
    throw error;
  }
}

export const fetchSpecialDealData = async () => {
  try {
    const data = await request(HYGRAPH_URL, SPECIAL_DEAL_QUERY);
    const latestDeal = data.specialRoomsDeals[0];
    if (!latestDeal || !latestDeal.deal) {
      return null;
    }
    const now = new Date();
    const validFrom = latestDeal.validFrom ? new Date(latestDeal.validFrom) : null;
    const validTo = latestDeal.validTo ? new Date(latestDeal.validTo) : null;

    // If only validFrom is set, deal is valid from that date onwards
    if (validFrom && !validTo && now >= validFrom) {
      return latestDeal.deal;
    }
    // If only validTo is set, deal is valid until that date
    if (!validFrom && validTo && now <= validTo) {
      return latestDeal.deal;
    }
    // If both are set, check if we are within the range
    if (validFrom && validTo && now >= validFrom && now <= validTo) {
      return latestDeal.deal;
    }
    // If neither is set, the deal is always active
    if (!validFrom && !validTo) {
      return latestDeal.deal;
    }
    // Otherwise, the deal is not active
    return null;
  } catch (error) {
    console.error('Error fetching special deal data:', error);
    return null;
  }
};

// API functions matching your PHP cache structure
export const fetchHeroData = async () => {
  try {
    const data = await request(HYGRAPH_URL, HERO_QUERY);
    // Filter active slides and sort by displayOrder (matching your PHP)
    const activeSlides = data.heroSlides
      .filter(slide => slide.active)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    return activeSlides;
  } catch (error) {
    console.error('Error fetching hero data:', error);
    return [];
  }
};

export const fetchSubHeroData = async () => {
  try {
    const data = await request(HYGRAPH_URL, SUB_HERO_QUERY);
    // Return first sub hero section (matching your PHP [0])
    return data.subHeroSections[0] || null;
  } catch (error) {
    console.error('Error fetching sub hero data:', error);
    return null;
  }
};

// Updated fetchRoomsData - optimized without gallery
export const fetchRoomsData = async () => {
  try {
    const data = await request(HYGRAPH_URL, ROOMS_QUERY);
    return data.rooms;
  } catch (error) {
    console.error('Error fetching rooms data:', error);
    return [];
  }
};

// New fetchRoomBySlug - detailed room with gallery for individual pages
export const fetchRoomBySlug = async (slug) => {
  try {
    const data = await request(HYGRAPH_URL, ROOM_BY_SLUG_QUERY, { slug });
    return data.rooms.length > 0 ? data.rooms[0] : null;
  } catch (error) {
    console.error('Error fetching room by slug:', error);
    return null;
  }
};

export const fetchExperienceData = async () => {
  try {
    const data = await request(HYGRAPH_URL, EXPERIENCE_QUERY);
    // Return first experience section (matching your PHP [0])
    return data.experienceSections[0] || null;
  } catch (error) {
    console.error('Error fetching experience data:', error);
    return null;
  }
};

// Helper function to fetch all data at once (like your PHP does)
export const fetchAllHomepageData = async () => {
  try {
    const [heroes, subHero, rooms, experiences, specialDeal] = await Promise.all([
      fetchHeroData(),
      fetchSubHeroData(),
      fetchRoomsData(),
      fetchExperienceData(),
      fetchSpecialDealData()
    ]);
    return {
      heroes,
      subHero,
      rooms,
      experiences,
      specialDeal
    };
  } catch (error) {
    console.error('Error fetching homepage data:', error);
    throw error;
  }
};


// Special Deal query
const SPECIAL_DEAL_QUERY = `
  query GetSpecialRoomsDeal {
    specialRoomsDeals(orderBy: createdAt_DESC, first: 1) {
      deal {
        html
      }
      validFrom
      validTo
    }
  }
`;
