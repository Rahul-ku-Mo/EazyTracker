export const formatDate = (timestamp) => {
  const seconds = timestamp.seconds;
  const date = new Date(seconds * 1000); // Convert seconds to milliseconds
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${day}-${month}-${year} ${hours}:${minutes}`;
};

export const randomColorGenerator = () => {
  return (
    "#" +
    Math.floor(Math.random() * 0x2f2f2f)
      .toString(16)
      .padStart(6, "0")
      .toUpperCase()
  );
};

export const MAX_BOARDS = 5;

export const DEFAULT_LABEL = {
  name: "None",
  color: "bg-slate-500",
};

export const DEFAULT_IMAGES = [
  {
    id: "LhDWW8PhPoE",
    slug: "aurora-phenomenon-LhDWW8PhPoE",
    alternative_slugs: {
      en: "aurora-phenomenon-LhDWW8PhPoE",
    },
    created_at: "2019-01-27T21:43:27Z",
    updated_at: "2024-03-14T18:46:12Z",
    promoted_at: "2019-01-29T07:09:17Z",
    width: 3687,
    height: 2452,
    color: "#262640",
    blur_hash: "L55Xy1E09Z-oNft5ofNH0J%2-pIq",
    description: null,
    alt_description: "Aurora phenomenon",
    breadcrumbs: [
      {
        slug: "images",
        title: "1,000,000+ Free Images",
        index: 0,
        type: "landing_page",
      },
      {
        slug: "apps",
        title: "Apps Images & Photos",
        index: 1,
        type: "landing_page",
      },
      {
        slug: "facebook",
        title: "Facebook Photos & Images",
        index: 2,
        type: "landing_page",
      },
    ],
    urls: {
      raw: "https://images.unsplash.com/photo-1548625361-58a9b86aa83b?ixid=M3w1Nzg5NDB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MTA0NDc4MDB8&ixlib=rb-4.0.3",
      full: "https://images.unsplash.com/photo-1548625361-58a9b86aa83b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w1Nzg5NDB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MTA0NDc4MDB8&ixlib=rb-4.0.3&q=85",
      regular:
        "https://images.unsplash.com/photo-1548625361-58a9b86aa83b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1Nzg5NDB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MTA0NDc4MDB8&ixlib=rb-4.0.3&q=80&w=1080",
      small:
        "https://images.unsplash.com/photo-1548625361-58a9b86aa83b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1Nzg5NDB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MTA0NDc4MDB8&ixlib=rb-4.0.3&q=80&w=400",
      thumb:
        "https://images.unsplash.com/photo-1548625361-58a9b86aa83b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1Nzg5NDB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MTA0NDc4MDB8&ixlib=rb-4.0.3&q=80&w=200",
      small_s3:
        "https://s3.us-west-2.amazonaws.com/images.unsplash.com/small/photo-1548625361-58a9b86aa83b",
    },
    links: {
      self: "https://api.unsplash.com/photos/aurora-phenomenon-LhDWW8PhPoE",
      html: "https://unsplash.com/photos/aurora-phenomenon-LhDWW8PhPoE",
      download:
        "https://unsplash.com/photos/LhDWW8PhPoE/download?ixid=M3w1Nzg5NDB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MTA0NDc4MDB8",
      download_location:
        "https://api.unsplash.com/photos/LhDWW8PhPoE/download?ixid=M3w1Nzg5NDB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MTA0NDc4MDB8",
    },
    likes: 1189,
    liked_by_user: false,
    current_user_collections: [],
    sponsorship: null,
    topic_submissions: {
      wallpapers: {
        status: "approved",
        approved_on: "2020-04-06T14:20:09Z",
      },
    },
    user: {
      id: "3iQrFoCMWzs",
      updated_at: "2023-12-19T14:36:35Z",
      username: "cosmictimetraveler",
      name: "Cosmic Timetraveler",
      first_name: "Cosmic",
      last_name: "Timetraveler",
      twitter_username: null,
      portfolio_url: null,
      bio: "Follow me @cosmictimetraveler on Instagram!",
      location: "Austin, TX",
      links: {
        self: "https://api.unsplash.com/users/cosmictimetraveler",
        html: "https://unsplash.com/@cosmictimetraveler",
        photos: "https://api.unsplash.com/users/cosmictimetraveler/photos",
        likes: "https://api.unsplash.com/users/cosmictimetraveler/likes",
        portfolio:
          "https://api.unsplash.com/users/cosmictimetraveler/portfolio",
        following:
          "https://api.unsplash.com/users/cosmictimetraveler/following",
        followers:
          "https://api.unsplash.com/users/cosmictimetraveler/followers",
      },
      profile_image: {
        small:
          "https://images.unsplash.com/profile-1450041608738-f5aff152561f?ixlib=rb-4.0.3&crop=faces&fit=crop&w=32&h=32",
        medium:
          "https://images.unsplash.com/profile-1450041608738-f5aff152561f?ixlib=rb-4.0.3&crop=faces&fit=crop&w=64&h=64",
        large:
          "https://images.unsplash.com/profile-1450041608738-f5aff152561f?ixlib=rb-4.0.3&crop=faces&fit=crop&w=128&h=128",
      },
      instagram_username: "cosmictimetraveler",
      total_collections: 1,
      total_likes: 6,
      total_photos: 200,
      total_promoted_photos: 60,
      accepted_tos: true,
      for_hire: false,
      social: {
        instagram_username: "cosmictimetraveler",
        portfolio_url: null,
        twitter_username: null,
        paypal_email: null,
      },
    },
    exif: {
      make: null,
      model: null,
      name: null,
      exposure_time: null,
      aperture: null,
      focal_length: null,
      iso: null,
    },
    location: {
      name: null,
      city: null,
      country: null,
      position: {
        latitude: null,
        longitude: null,
      },
    },
    views: 28875144,
    downloads: 571896,
  },
  {
    id: "rEMlN5EmZ9I",
    slug: "top-view-of-island-rEMlN5EmZ9I",
    alternative_slugs: {
      en: "top-view-of-island-rEMlN5EmZ9I",
    },
    created_at: "2018-04-30T12:45:53Z",
    updated_at: "2024-03-14T12:25:35Z",
    promoted_at: "2018-05-01T11:38:03Z",
    width: 6522,
    height: 3669,
    color: "#f3f3f3",
    blur_hash: "L~I#}yWBt7ay~qazoLay%0ofRjj[",
    description:
      "Rising before the sun and setting into the grey gloom, I was apprehensive of what the ‘sunrise’ might hold. My expectations were only dampened more by the slight drizzle experienced on the coastal path that leads to the tip of Dorset’s Isle of Purbeck. But sometimes perseverance and determination pays off and a little bit of luck can lead to one of the most impressive views I’ve ever seen.",
    alt_description: "top view of island",
    breadcrumbs: [],
    urls: {
      raw: "https://images.unsplash.com/photo-1525092005711-6006b26262b9?ixid=M3w1Nzg5NDB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MTA0NDc4MDB8&ixlib=rb-4.0.3",
      full: "https://images.unsplash.com/photo-1525092005711-6006b26262b9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w1Nzg5NDB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MTA0NDc4MDB8&ixlib=rb-4.0.3&q=85",
      regular:
        "https://images.unsplash.com/photo-1525092005711-6006b26262b9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1Nzg5NDB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MTA0NDc4MDB8&ixlib=rb-4.0.3&q=80&w=1080",
      small:
        "https://images.unsplash.com/photo-1525092005711-6006b26262b9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1Nzg5NDB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MTA0NDc4MDB8&ixlib=rb-4.0.3&q=80&w=400",
      thumb:
        "https://images.unsplash.com/photo-1525092005711-6006b26262b9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1Nzg5NDB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MTA0NDc4MDB8&ixlib=rb-4.0.3&q=80&w=200",
      small_s3:
        "https://s3.us-west-2.amazonaws.com/images.unsplash.com/small/photo-1525092005711-6006b26262b9",
    },
    links: {
      self: "https://api.unsplash.com/photos/top-view-of-island-rEMlN5EmZ9I",
      html: "https://unsplash.com/photos/top-view-of-island-rEMlN5EmZ9I",
      download:
        "https://unsplash.com/photos/rEMlN5EmZ9I/download?ixid=M3w1Nzg5NDB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MTA0NDc4MDB8",
      download_location:
        "https://api.unsplash.com/photos/rEMlN5EmZ9I/download?ixid=M3w1Nzg5NDB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MTA0NDc4MDB8",
    },
    likes: 512,
    liked_by_user: false,
    current_user_collections: [],
    sponsorship: null,
    topic_submissions: {},
    user: {
      id: "yRSG19_VUjg",
      updated_at: "2024-02-16T07:43:41Z",
      username: "jack_anstey",
      name: "Jack Anstey",
      first_name: "Jack",
      last_name: "Anstey",
      twitter_username: null,
      portfolio_url: "http://www.instagram.com/jack_anstey",
      bio: "www.anstey.studio",
      location: "UK",
      links: {
        self: "https://api.unsplash.com/users/jack_anstey",
        html: "https://unsplash.com/@jack_anstey",
        photos: "https://api.unsplash.com/users/jack_anstey/photos",
        likes: "https://api.unsplash.com/users/jack_anstey/likes",
        portfolio: "https://api.unsplash.com/users/jack_anstey/portfolio",
        following: "https://api.unsplash.com/users/jack_anstey/following",
        followers: "https://api.unsplash.com/users/jack_anstey/followers",
      },
      profile_image: {
        small:
          "https://images.unsplash.com/profile-1504096305712-4cdd8cb95ed5?ixlib=rb-4.0.3&crop=faces&fit=crop&w=32&h=32",
        medium:
          "https://images.unsplash.com/profile-1504096305712-4cdd8cb95ed5?ixlib=rb-4.0.3&crop=faces&fit=crop&w=64&h=64",
        large:
          "https://images.unsplash.com/profile-1504096305712-4cdd8cb95ed5?ixlib=rb-4.0.3&crop=faces&fit=crop&w=128&h=128",
      },
      instagram_username: "jack_anstey",
      total_collections: 0,
      total_likes: 2,
      total_photos: 12,
      total_promoted_photos: 10,
      accepted_tos: false,
      for_hire: false,
      social: {
        instagram_username: "jack_anstey",
        portfolio_url: "http://www.instagram.com/jack_anstey",
        twitter_username: null,
        paypal_email: null,
      },
    },
    exif: {
      make: null,
      model: null,
      name: null,
      exposure_time: null,
      aperture: null,
      focal_length: null,
      iso: null,
    },
    location: {
      name: "Old Harry Rocks, United Kingdom",
      city: null,
      country: "United Kingdom",
      position: {
        latitude: 50.6427779,
        longitude: -1.92274139999995,
      },
    },
    views: 6311970,
    downloads: 10947,
  },
  {
    id: "5Dga0T0x6GY",
    slug: "close-up-photo-of-sea-waves-5Dga0T0x6GY",
    alternative_slugs: {
      en: "close-up-photo-of-sea-waves-5Dga0T0x6GY",
    },
    created_at: "2015-08-13T23:33:20Z",
    updated_at: "2024-03-13T21:26:45Z",
    promoted_at: "2015-08-13T23:33:20Z",
    width: 3200,
    height: 1800,
    color: "#c0d9f3",
    blur_hash: "LlD-O58_RNt3?wM{M{odMw%1M}WB",
    description: "Blue ocean wave",
    alt_description: "close-up photo of sea waves",
    breadcrumbs: [],
    urls: {
      raw: "https://images.unsplash.com/photo-1439508472515-4899b144f04d?ixid=M3w1Nzg5NDB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MTA0NDc4MDB8&ixlib=rb-4.0.3",
      full: "https://images.unsplash.com/photo-1439508472515-4899b144f04d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w1Nzg5NDB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MTA0NDc4MDB8&ixlib=rb-4.0.3&q=85",
      regular:
        "https://images.unsplash.com/photo-1439508472515-4899b144f04d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1Nzg5NDB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MTA0NDc4MDB8&ixlib=rb-4.0.3&q=80&w=1080",
      small:
        "https://images.unsplash.com/photo-1439508472515-4899b144f04d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1Nzg5NDB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MTA0NDc4MDB8&ixlib=rb-4.0.3&q=80&w=400",
      thumb:
        "https://images.unsplash.com/photo-1439508472515-4899b144f04d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1Nzg5NDB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MTA0NDc4MDB8&ixlib=rb-4.0.3&q=80&w=200",
      small_s3:
        "https://s3.us-west-2.amazonaws.com/images.unsplash.com/small/photo-1439508472515-4899b144f04d",
    },
    links: {
      self: "https://api.unsplash.com/photos/close-up-photo-of-sea-waves-5Dga0T0x6GY",
      html: "https://unsplash.com/photos/close-up-photo-of-sea-waves-5Dga0T0x6GY",
      download:
        "https://unsplash.com/photos/5Dga0T0x6GY/download?ixid=M3w1Nzg5NDB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MTA0NDc4MDB8",
      download_location:
        "https://api.unsplash.com/photos/5Dga0T0x6GY/download?ixid=M3w1Nzg5NDB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MTA0NDc4MDB8",
    },
    likes: 1662,
    liked_by_user: false,
    current_user_collections: [],
    sponsorship: null,
    topic_submissions: {},
    user: {
      id: "-lTCKb73yA8",
      updated_at: "2024-02-17T15:25:44Z",
      username: "schmidy",
      name: "Austin Schmid",
      first_name: "Austin",
      last_name: "Schmid",
      twitter_username: null,
      portfolio_url: "http://schmidy.com",
      bio: "Surf, landscape, and other",
      location: "California ",
      links: {
        self: "https://api.unsplash.com/users/schmidy",
        html: "https://unsplash.com/@schmidy",
        photos: "https://api.unsplash.com/users/schmidy/photos",
        likes: "https://api.unsplash.com/users/schmidy/likes",
        portfolio: "https://api.unsplash.com/users/schmidy/portfolio",
        following: "https://api.unsplash.com/users/schmidy/following",
        followers: "https://api.unsplash.com/users/schmidy/followers",
      },
      profile_image: {
        small:
          "https://images.unsplash.com/placeholder-avatars/extra-large.jpg?ixlib=rb-4.0.3&crop=faces&fit=crop&w=32&h=32",
        medium:
          "https://images.unsplash.com/placeholder-avatars/extra-large.jpg?ixlib=rb-4.0.3&crop=faces&fit=crop&w=64&h=64",
        large:
          "https://images.unsplash.com/placeholder-avatars/extra-large.jpg?ixlib=rb-4.0.3&crop=faces&fit=crop&w=128&h=128",
      },
      instagram_username: "schmidyphotography",
      total_collections: 0,
      total_likes: 28,
      total_photos: 123,
      total_promoted_photos: 56,
      accepted_tos: true,
      for_hire: false,
      social: {
        instagram_username: "schmidyphotography",
        portfolio_url: "http://schmidy.com",
        twitter_username: null,
        paypal_email: null,
      },
    },
    exif: {
      make: null,
      model: null,
      name: null,
      exposure_time: null,
      aperture: null,
      focal_length: null,
      iso: null,
    },
    location: {
      name: "Moonlight State Beach, Encinitas, United States",
      city: "Encinitas",
      country: "United States",
      position: {
        latitude: 33.0478787,
        longitude: -117.2979158,
      },
    },
    views: 17788425,
    downloads: 118672,
  },
  {
    id: "Q47I_dCsNyY",
    slug: "landscape-photography-of-mountain-under-cloudy-skty-Q47I_dCsNyY",
    alternative_slugs: {
      en: "landscape-photography-of-mountain-under-cloudy-skty-Q47I_dCsNyY",
    },
    created_at: "2015-08-09T12:25:07Z",
    updated_at: "2024-03-14T01:30:41Z",
    promoted_at: "2015-08-09T12:25:07Z",
    width: 6016,
    height: 4000,
    color: "#c0c0d9",
    blur_hash: "LYFF:KM|D$og_4M_WBt7%Nj]ogRP",
    description: "Mountains reflect in lake",
    alt_description: "landscape photography of mountain under cloudy skty",
    breadcrumbs: [],
    urls: {
      raw: "https://images.unsplash.com/photo-1439123068749-20f4035bd7ed?ixid=M3w1Nzg5NDB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MTA0NDc4MDB8&ixlib=rb-4.0.3",
      full: "https://images.unsplash.com/photo-1439123068749-20f4035bd7ed?crop=entropy&cs=srgb&fm=jpg&ixid=M3w1Nzg5NDB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MTA0NDc4MDB8&ixlib=rb-4.0.3&q=85",
      regular:
        "https://images.unsplash.com/photo-1439123068749-20f4035bd7ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1Nzg5NDB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MTA0NDc4MDB8&ixlib=rb-4.0.3&q=80&w=1080",
      small:
        "https://images.unsplash.com/photo-1439123068749-20f4035bd7ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1Nzg5NDB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MTA0NDc4MDB8&ixlib=rb-4.0.3&q=80&w=400",
      thumb:
        "https://images.unsplash.com/photo-1439123068749-20f4035bd7ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1Nzg5NDB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MTA0NDc4MDB8&ixlib=rb-4.0.3&q=80&w=200",
      small_s3:
        "https://s3.us-west-2.amazonaws.com/images.unsplash.com/small/photo-1439123068749-20f4035bd7ed",
    },
    links: {
      self: "https://api.unsplash.com/photos/landscape-photography-of-mountain-under-cloudy-skty-Q47I_dCsNyY",
      html: "https://unsplash.com/photos/landscape-photography-of-mountain-under-cloudy-skty-Q47I_dCsNyY",
      download:
        "https://unsplash.com/photos/Q47I_dCsNyY/download?ixid=M3w1Nzg5NDB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MTA0NDc4MDB8",
      download_location:
        "https://api.unsplash.com/photos/Q47I_dCsNyY/download?ixid=M3w1Nzg5NDB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MTA0NDc4MDB8",
    },
    likes: 1008,
    liked_by_user: false,
    current_user_collections: [],
    sponsorship: null,
    topic_submissions: {},
    user: {
      id: "hz1AOBH00GQ",
      updated_at: "2023-10-31T14:46:09Z",
      username: "pbouillot",
      name: "Pierre Bouillot",
      first_name: "Pierre",
      last_name: "Bouillot",
      twitter_username: null,
      portfolio_url: null,
      bio: null,
      location: null,
      links: {
        self: "https://api.unsplash.com/users/pbouillot",
        html: "https://unsplash.com/@pbouillot",
        photos: "https://api.unsplash.com/users/pbouillot/photos",
        likes: "https://api.unsplash.com/users/pbouillot/likes",
        portfolio: "https://api.unsplash.com/users/pbouillot/portfolio",
        following: "https://api.unsplash.com/users/pbouillot/following",
        followers: "https://api.unsplash.com/users/pbouillot/followers",
      },
      profile_image: {
        small:
          "https://images.unsplash.com/placeholder-avatars/extra-large.jpg?ixlib=rb-4.0.3&crop=faces&fit=crop&w=32&h=32",
        medium:
          "https://images.unsplash.com/placeholder-avatars/extra-large.jpg?ixlib=rb-4.0.3&crop=faces&fit=crop&w=64&h=64",
        large:
          "https://images.unsplash.com/placeholder-avatars/extra-large.jpg?ixlib=rb-4.0.3&crop=faces&fit=crop&w=128&h=128",
      },
      instagram_username: null,
      total_collections: 0,
      total_likes: 0,
      total_photos: 8,
      total_promoted_photos: 7,
      accepted_tos: false,
      for_hire: false,
      social: {
        instagram_username: null,
        portfolio_url: null,
        twitter_username: null,
        paypal_email: null,
      },
    },
    exif: {
      make: null,
      model: null,
      name: null,
      exposure_time: null,
      aperture: null,
      focal_length: null,
      iso: null,
    },
    location: {
      name: "Norvège",
      city: null,
      country: null,
      position: {
        latitude: 60.472024,
        longitude: 8.46894599999996,
      },
    },
    views: 13589652,
    downloads: 59138,
  },
  {
    id: "EB546E6QK9Q",
    slug: "white-petaled-flower-EB546E6QK9Q",
    alternative_slugs: {
      en: "white-petaled-flower-EB546E6QK9Q",
    },
    created_at: "2019-03-17T05:32:49Z",
    updated_at: "2024-03-14T06:30:39Z",
    promoted_at: "2019-03-20T06:13:50Z",
    width: 5668,
    height: 3779,
    color: "#8cc0c0",
    blur_hash: "LCGm.1DiNcM{S4t7i^jFLgO@i_xu",
    description: null,
    alt_description: "white petaled flower",
    breadcrumbs: [],
    urls: {
      raw: "https://images.unsplash.com/photo-1552800694-4d518f028b89?ixid=M3w1Nzg5NDB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MTA0NDc4MDB8&ixlib=rb-4.0.3",
      full: "https://images.unsplash.com/photo-1552800694-4d518f028b89?crop=entropy&cs=srgb&fm=jpg&ixid=M3w1Nzg5NDB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MTA0NDc4MDB8&ixlib=rb-4.0.3&q=85",
      regular:
        "https://images.unsplash.com/photo-1552800694-4d518f028b89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1Nzg5NDB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MTA0NDc4MDB8&ixlib=rb-4.0.3&q=80&w=1080",
      small:
        "https://images.unsplash.com/photo-1552800694-4d518f028b89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1Nzg5NDB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MTA0NDc4MDB8&ixlib=rb-4.0.3&q=80&w=400",
      thumb:
        "https://images.unsplash.com/photo-1552800694-4d518f028b89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1Nzg5NDB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MTA0NDc4MDB8&ixlib=rb-4.0.3&q=80&w=200",
      small_s3:
        "https://s3.us-west-2.amazonaws.com/images.unsplash.com/small/photo-1552800694-4d518f028b89",
    },
    links: {
      self: "https://api.unsplash.com/photos/white-petaled-flower-EB546E6QK9Q",
      html: "https://unsplash.com/photos/white-petaled-flower-EB546E6QK9Q",
      download:
        "https://unsplash.com/photos/EB546E6QK9Q/download?ixid=M3w1Nzg5NDB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MTA0NDc4MDB8",
      download_location:
        "https://api.unsplash.com/photos/EB546E6QK9Q/download?ixid=M3w1Nzg5NDB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MTA0NDc4MDB8",
    },
    likes: 212,
    liked_by_user: false,
    current_user_collections: [],
    sponsorship: null,
    topic_submissions: {},
    user: {
      id: "XwVML3A65Fs",
      updated_at: "2024-02-17T12:53:47Z",
      username: "runblue",
      name: "Xiaolong Wong",
      first_name: "Xiaolong",
      last_name: "Wong",
      twitter_username: null,
      portfolio_url: null,
      bio: "China / \r\nFujifilm / \r\nWeChat：wx649311165\r\n商用请告知",
      location: "Linyi，China",
      links: {
        self: "https://api.unsplash.com/users/runblue",
        html: "https://unsplash.com/@runblue",
        photos: "https://api.unsplash.com/users/runblue/photos",
        likes: "https://api.unsplash.com/users/runblue/likes",
        portfolio: "https://api.unsplash.com/users/runblue/portfolio",
        following: "https://api.unsplash.com/users/runblue/following",
        followers: "https://api.unsplash.com/users/runblue/followers",
      },
      profile_image: {
        small:
          "https://images.unsplash.com/profile-1537350808197-1408a9a9fef0?ixlib=rb-4.0.3&crop=faces&fit=crop&w=32&h=32",
        medium:
          "https://images.unsplash.com/profile-1537350808197-1408a9a9fef0?ixlib=rb-4.0.3&crop=faces&fit=crop&w=64&h=64",
        large:
          "https://images.unsplash.com/profile-1537350808197-1408a9a9fef0?ixlib=rb-4.0.3&crop=faces&fit=crop&w=128&h=128",
      },
      instagram_username: "run.blue",
      total_collections: 6,
      total_likes: 282,
      total_photos: 269,
      total_promoted_photos: 55,
      accepted_tos: true,
      for_hire: false,
      social: {
        instagram_username: "run.blue",
        portfolio_url: null,
        twitter_username: null,
        paypal_email: null,
      },
    },
    exif: {
      make: "FUJIFILM",
      model: "X-T2",
      name: "FUJIFILM, X-T2",
      exposure_time: "1/3000",
      aperture: "2.8",
      focal_length: "50.0",
      iso: 200,
    },
    location: {
      name: null,
      city: null,
      country: null,
      position: {
        latitude: null,
        longitude: null,
      },
    },
    views: 14271496,
    downloads: 10352,
  },
  {
    id: "_MCLUFQlZ_c",
    slug: "snow-covered-mountain-under-zinc-sky-_MCLUFQlZ_c",
    alternative_slugs: {
      en: "snow-covered-mountain-under-zinc-sky-_MCLUFQlZ_c",
    },
    created_at: "2020-03-07T16:20:00Z",
    updated_at: "2024-03-14T05:41:09Z",
    promoted_at: "2020-03-07T23:54:01Z",
    width: 2432,
    height: 3648,
    color: "#c0c0c0",
    blur_hash: "LcI5**IUNFa|_NfkWBj[9FkBoffP",
    description: null,
    alt_description: "snow covered mountain under zinc sky",
    breadcrumbs: [],
    urls: {
      raw: "https://images.unsplash.com/photo-1583597974512-13fe608d4600?ixid=M3w1Nzg5NDB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MTA0NDc4MDB8&ixlib=rb-4.0.3",
      full: "https://images.unsplash.com/photo-1583597974512-13fe608d4600?crop=entropy&cs=srgb&fm=jpg&ixid=M3w1Nzg5NDB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MTA0NDc4MDB8&ixlib=rb-4.0.3&q=85",
      regular:
        "https://images.unsplash.com/photo-1583597974512-13fe608d4600?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1Nzg5NDB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MTA0NDc4MDB8&ixlib=rb-4.0.3&q=80&w=1080",
      small:
        "https://images.unsplash.com/photo-1583597974512-13fe608d4600?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1Nzg5NDB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MTA0NDc4MDB8&ixlib=rb-4.0.3&q=80&w=400",
      thumb:
        "https://images.unsplash.com/photo-1583597974512-13fe608d4600?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1Nzg5NDB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MTA0NDc4MDB8&ixlib=rb-4.0.3&q=80&w=200",
      small_s3:
        "https://s3.us-west-2.amazonaws.com/images.unsplash.com/small/photo-1583597974512-13fe608d4600",
    },
    links: {
      self: "https://api.unsplash.com/photos/snow-covered-mountain-under-zinc-sky-_MCLUFQlZ_c",
      html: "https://unsplash.com/photos/snow-covered-mountain-under-zinc-sky-_MCLUFQlZ_c",
      download:
        "https://unsplash.com/photos/_MCLUFQlZ_c/download?ixid=M3w1Nzg5NDB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MTA0NDc4MDB8",
      download_location:
        "https://api.unsplash.com/photos/_MCLUFQlZ_c/download?ixid=M3w1Nzg5NDB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MTA0NDc4MDB8",
    },
    likes: 130,
    liked_by_user: false,
    current_user_collections: [],
    sponsorship: null,
    topic_submissions: {},
    asset_type: "photo",
    user: {
      id: "a26S7TqsS6M",
      updated_at: "2024-03-14T16:19:43Z",
      username: "3tnik",
      name: "Ave Calvar",
      first_name: "Ave",
      last_name: "Calvar",
      twitter_username: null,
      portfolio_url: "http://avecalvar.com",
      bio: "Creative photographer and editor.",
      location: "Spain",
      links: {
        self: "https://api.unsplash.com/users/3tnik",
        html: "https://unsplash.com/@3tnik",
        photos: "https://api.unsplash.com/users/3tnik/photos",
        likes: "https://api.unsplash.com/users/3tnik/likes",
        portfolio: "https://api.unsplash.com/users/3tnik/portfolio",
        following: "https://api.unsplash.com/users/3tnik/following",
        followers: "https://api.unsplash.com/users/3tnik/followers",
      },
      profile_image: {
        small:
          "https://images.unsplash.com/profile-1679603692411-ac2a2e2b0d18image?ixlib=rb-4.0.3&crop=faces&fit=crop&w=32&h=32",
        medium:
          "https://images.unsplash.com/profile-1679603692411-ac2a2e2b0d18image?ixlib=rb-4.0.3&crop=faces&fit=crop&w=64&h=64",
        large:
          "https://images.unsplash.com/profile-1679603692411-ac2a2e2b0d18image?ixlib=rb-4.0.3&crop=faces&fit=crop&w=128&h=128",
      },
      instagram_username: "avecalvar",
      total_collections: 104,
      total_likes: 0,
      total_photos: 10154,
      total_promoted_photos: 276,
      accepted_tos: true,
      for_hire: true,
      social: {
        instagram_username: "avecalvar",
        portfolio_url: "http://avecalvar.com",
        twitter_username: null,
        paypal_email: null,
      },
    },
    exif: {
      make: "Canon",
      model: "Canon EOS 6D",
      name: "Canon, EOS 6D",
      exposure_time: "1/500",
      aperture: "10.0",
      focal_length: "109.0",
      iso: 200,
    },
    location: {
      name: null,
      city: null,
      country: null,
      position: {
        latitude: null,
        longitude: null,
      },
    },
    views: 10226950,
    downloads: 9750,
  },
  {
    id: "j4PQ4d0ZBXU",
    slug: "snowy-field-and-forest-j4PQ4d0ZBXU",
    alternative_slugs: {
      en: "snowy-field-and-forest-j4PQ4d0ZBXU",
    },
    created_at: "2018-11-20T05:43:01Z",
    updated_at: "2024-03-14T19:46:09Z",
    promoted_at: "2018-11-20T13:23:39Z",
    width: 3000,
    height: 1800,
    color: "#d9d9d9",
    blur_hash: "LDM*8TM|D%%M4mNGRjxu_3RjRQt7",
    description:
      "These tracks were from the sled my daughter was sleeping in as we walked across this frozen lake.",
    alt_description: "snowy field and forest",
    breadcrumbs: [
      {
        slug: "images",
        title: "1,000,000+ Free Images",
        index: 0,
        type: "landing_page",
      },
      {
        slug: "nature",
        title: "Nature Images",
        index: 1,
        type: "landing_page",
      },
    ],
    urls: {
      raw: "https://images.unsplash.com/photo-1542692576-0eb0bd11a968?ixid=M3w1Nzg5NDB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MTA0NDc4MDB8&ixlib=rb-4.0.3",
      full: "https://images.unsplash.com/photo-1542692576-0eb0bd11a968?crop=entropy&cs=srgb&fm=jpg&ixid=M3w1Nzg5NDB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MTA0NDc4MDB8&ixlib=rb-4.0.3&q=85",
      regular:
        "https://images.unsplash.com/photo-1542692576-0eb0bd11a968?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1Nzg5NDB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MTA0NDc4MDB8&ixlib=rb-4.0.3&q=80&w=1080",
      small:
        "https://images.unsplash.com/photo-1542692576-0eb0bd11a968?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1Nzg5NDB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MTA0NDc4MDB8&ixlib=rb-4.0.3&q=80&w=400",
      thumb:
        "https://images.unsplash.com/photo-1542692576-0eb0bd11a968?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1Nzg5NDB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MTA0NDc4MDB8&ixlib=rb-4.0.3&q=80&w=200",
      small_s3:
        "https://s3.us-west-2.amazonaws.com/images.unsplash.com/small/photo-1542692576-0eb0bd11a968",
    },
    links: {
      self: "https://api.unsplash.com/photos/snowy-field-and-forest-j4PQ4d0ZBXU",
      html: "https://unsplash.com/photos/snowy-field-and-forest-j4PQ4d0ZBXU",
      download:
        "https://unsplash.com/photos/j4PQ4d0ZBXU/download?ixid=M3w1Nzg5NDB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MTA0NDc4MDB8",
      download_location:
        "https://api.unsplash.com/photos/j4PQ4d0ZBXU/download?ixid=M3w1Nzg5NDB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MTA0NDc4MDB8",
    },
    likes: 161,
    liked_by_user: false,
    current_user_collections: [],
    sponsorship: null,
    topic_submissions: {
      nature: {
        status: "approved",
        approved_on: "2020-04-06T14:20:12Z",
      },
    },
    asset_type: "photo",
    user: {
      id: "6kAcKtuStnI",
      updated_at: "2023-12-20T04:02:34Z",
      username: "souvenirpixels",
      name: "James Wheeler",
      first_name: "James",
      last_name: "Wheeler",
      twitter_username: "souvenirpixels",
      portfolio_url: "https://www.souvenirpixels.com",
      bio: "Found my photos useful? I have lots more on my website, check them out.",
      location: "Vancouver, BC, Canada",
      links: {
        self: "https://api.unsplash.com/users/souvenirpixels",
        html: "https://unsplash.com/@souvenirpixels",
        photos: "https://api.unsplash.com/users/souvenirpixels/photos",
        likes: "https://api.unsplash.com/users/souvenirpixels/likes",
        portfolio: "https://api.unsplash.com/users/souvenirpixels/portfolio",
        following: "https://api.unsplash.com/users/souvenirpixels/following",
        followers: "https://api.unsplash.com/users/souvenirpixels/followers",
      },
      profile_image: {
        small:
          "https://images.unsplash.com/profile-1536292914685-8ad08e72afed?ixlib=rb-4.0.3&crop=faces&fit=crop&w=32&h=32",
        medium:
          "https://images.unsplash.com/profile-1536292914685-8ad08e72afed?ixlib=rb-4.0.3&crop=faces&fit=crop&w=64&h=64",
        large:
          "https://images.unsplash.com/profile-1536292914685-8ad08e72afed?ixlib=rb-4.0.3&crop=faces&fit=crop&w=128&h=128",
      },
      instagram_username: "souvenirpixels",
      total_collections: 0,
      total_likes: 1,
      total_photos: 87,
      total_promoted_photos: 13,
      accepted_tos: true,
      for_hire: true,
      social: {
        instagram_username: "souvenirpixels",
        portfolio_url: "https://www.souvenirpixels.com",
        twitter_username: "souvenirpixels",
        paypal_email: null,
      },
    },
    exif: {
      make: "NIKON CORPORATION",
      model: "NIKON D5000",
      name: "NIKON CORPORATION, NIKON D5000",
      exposure_time: "1/100",
      aperture: "11.0",
      focal_length: "18.0",
      iso: 100,
    },
    location: {
      name: "Joffre Lake, Pemberton, Canada",
      city: "Pemberton",
      country: "Canada",
      position: {
        latitude: null,
        longitude: null,
      },
    },
    views: 6375585,
    downloads: 12095,
  },
  {
    id: "QlHdnD7fRWc",
    slug: "jellyfish-illustration-QlHdnD7fRWc",
    alternative_slugs: {
      en: "jellyfish-illustration-QlHdnD7fRWc",
    },
    created_at: "2019-03-02T18:21:40Z",
    updated_at: "2024-03-14T04:35:43Z",
    promoted_at: "2019-03-03T10:41:31Z",
    width: 3024,
    height: 4032,
    color: "#404040",
    blur_hash: "L58NFNIo7M-T~DWBS~W;NIj[xaI:",
    description: null,
    alt_description: "jellyfish illustration",
    breadcrumbs: [],
    urls: {
      raw: "https://images.unsplash.com/photo-1551550846-ec82cbb5d4a6?ixid=M3w1Nzg5NDB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MTA0NDc4MDB8&ixlib=rb-4.0.3",
      full: "https://images.unsplash.com/photo-1551550846-ec82cbb5d4a6?crop=entropy&cs=srgb&fm=jpg&ixid=M3w1Nzg5NDB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MTA0NDc4MDB8&ixlib=rb-4.0.3&q=85",
      regular:
        "https://images.unsplash.com/photo-1551550846-ec82cbb5d4a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1Nzg5NDB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MTA0NDc4MDB8&ixlib=rb-4.0.3&q=80&w=1080",
      small:
        "https://images.unsplash.com/photo-1551550846-ec82cbb5d4a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1Nzg5NDB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MTA0NDc4MDB8&ixlib=rb-4.0.3&q=80&w=400",
      thumb:
        "https://images.unsplash.com/photo-1551550846-ec82cbb5d4a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1Nzg5NDB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MTA0NDc4MDB8&ixlib=rb-4.0.3&q=80&w=200",
      small_s3:
        "https://s3.us-west-2.amazonaws.com/images.unsplash.com/small/photo-1551550846-ec82cbb5d4a6",
    },
    links: {
      self: "https://api.unsplash.com/photos/jellyfish-illustration-QlHdnD7fRWc",
      html: "https://unsplash.com/photos/jellyfish-illustration-QlHdnD7fRWc",
      download:
        "https://unsplash.com/photos/QlHdnD7fRWc/download?ixid=M3w1Nzg5NDB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MTA0NDc4MDB8",
      download_location:
        "https://api.unsplash.com/photos/QlHdnD7fRWc/download?ixid=M3w1Nzg5NDB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MTA0NDc4MDB8",
    },
    likes: 644,
    liked_by_user: false,
    current_user_collections: [],
    sponsorship: null,
    topic_submissions: {},
    asset_type: "photo",
    user: {
      id: "fVj_uOZJbNk",
      updated_at: "2023-09-25T03:29:24Z",
      username: "kerem",
      name: "Kerem Suer",
      first_name: "Kerem",
      last_name: "Suer",
      twitter_username: "kerem",
      portfolio_url: "http://kerem.co",
      bio: "Design",
      location: "San Francisco, California",
      links: {
        self: "https://api.unsplash.com/users/kerem",
        html: "https://unsplash.com/@kerem",
        photos: "https://api.unsplash.com/users/kerem/photos",
        likes: "https://api.unsplash.com/users/kerem/likes",
        portfolio: "https://api.unsplash.com/users/kerem/portfolio",
        following: "https://api.unsplash.com/users/kerem/following",
        followers: "https://api.unsplash.com/users/kerem/followers",
      },
      profile_image: {
        small:
          "https://images.unsplash.com/profile-1539491185868-c4182d332f83?ixlib=rb-4.0.3&crop=faces&fit=crop&w=32&h=32",
        medium:
          "https://images.unsplash.com/profile-1539491185868-c4182d332f83?ixlib=rb-4.0.3&crop=faces&fit=crop&w=64&h=64",
        large:
          "https://images.unsplash.com/profile-1539491185868-c4182d332f83?ixlib=rb-4.0.3&crop=faces&fit=crop&w=128&h=128",
      },
      instagram_username: "keremsuer",
      total_collections: 0,
      total_likes: 1,
      total_photos: 6,
      total_promoted_photos: 2,
      accepted_tos: true,
      for_hire: false,
      social: {
        instagram_username: "keremsuer",
        portfolio_url: "http://kerem.co",
        twitter_username: "kerem",
        paypal_email: null,
      },
    },
    exif: {
      make: "Apple",
      model: "iPhone XS",
      name: "Apple, iPhone XS",
      exposure_time: "1/40",
      aperture: "1.8",
      focal_length: "4.2",
      iso: 400,
    },
    location: {
      name: "886 Cannery Row, Monterey, CA 93940, USA, United States",
      city: "Monterey",
      country: "United States",
      position: {
        latitude: 36.61770278,
        longitude: -121.90140556,
      },
    },
    views: 4433625,
    downloads: 9190,
  },
  {
    id: "RncjPlu5dnY",
    slug: "yellow-and-red-metal-bar-RncjPlu5dnY",
    alternative_slugs: {
      en: "yellow-and-red-metal-bar-RncjPlu5dnY",
    },
    created_at: "2020-03-29T04:50:29Z",
    updated_at: "2024-03-14T10:38:52Z",
    promoted_at: "2020-03-30T14:48:01Z",
    width: 6720,
    height: 4480,
    color: "#262626",
    blur_hash: "LDBpd?fx9Gv}~N-oN3In$bs;4=%g",
    description: null,
    alt_description: "yellow and red metal bar",
    breadcrumbs: [],
    urls: {
      raw: "https://images.unsplash.com/photo-1585457288697-180e55c12dbb?ixid=M3w1Nzg5NDB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MTA0NDc4MDB8&ixlib=rb-4.0.3",
      full: "https://images.unsplash.com/photo-1585457288697-180e55c12dbb?crop=entropy&cs=srgb&fm=jpg&ixid=M3w1Nzg5NDB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MTA0NDc4MDB8&ixlib=rb-4.0.3&q=85",
      regular:
        "https://images.unsplash.com/photo-1585457288697-180e55c12dbb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1Nzg5NDB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MTA0NDc4MDB8&ixlib=rb-4.0.3&q=80&w=1080",
      small:
        "https://images.unsplash.com/photo-1585457288697-180e55c12dbb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1Nzg5NDB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MTA0NDc4MDB8&ixlib=rb-4.0.3&q=80&w=400",
      thumb:
        "https://images.unsplash.com/photo-1585457288697-180e55c12dbb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w1Nzg5NDB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MTA0NDc4MDB8&ixlib=rb-4.0.3&q=80&w=200",
      small_s3:
        "https://s3.us-west-2.amazonaws.com/images.unsplash.com/small/photo-1585457288697-180e55c12dbb",
    },
    links: {
      self: "https://api.unsplash.com/photos/yellow-and-red-metal-bar-RncjPlu5dnY",
      html: "https://unsplash.com/photos/yellow-and-red-metal-bar-RncjPlu5dnY",
      download:
        "https://unsplash.com/photos/RncjPlu5dnY/download?ixid=M3w1Nzg5NDB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MTA0NDc4MDB8",
      download_location:
        "https://api.unsplash.com/photos/RncjPlu5dnY/download?ixid=M3w1Nzg5NDB8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MTA0NDc4MDB8",
    },
    likes: 112,
    liked_by_user: false,
    current_user_collections: [],
    sponsorship: null,
    topic_submissions: {
      experimental: {
        status: "rejected",
      },
      "textures-patterns": {
        status: "approved",
        approved_on: "2020-04-06T14:20:11Z",
      },
    },
    user: {
      id: "CpBDVgrthTM",
      updated_at: "2024-03-14T19:29:54Z",
      username: "ninjason",
      name: "Jason Leung",
      first_name: "Jason",
      last_name: "Leung",
      twitter_username: null,
      portfolio_url: "https://jasonleung.co",
      bio: "Shooting with Canon R5/R6.\r\nThis is my way of giving back,  keep up with what I photograph on Instagram @xninjason",
      location: "Bay Area, California",
      links: {
        self: "https://api.unsplash.com/users/ninjason",
        html: "https://unsplash.com/@ninjason",
        photos: "https://api.unsplash.com/users/ninjason/photos",
        likes: "https://api.unsplash.com/users/ninjason/likes",
        portfolio: "https://api.unsplash.com/users/ninjason/portfolio",
        following: "https://api.unsplash.com/users/ninjason/following",
        followers: "https://api.unsplash.com/users/ninjason/followers",
      },
      profile_image: {
        small:
          "https://images.unsplash.com/profile-1574623311321-015452cd1304image?ixlib=rb-4.0.3&crop=faces&fit=crop&w=32&h=32",
        medium:
          "https://images.unsplash.com/profile-1574623311321-015452cd1304image?ixlib=rb-4.0.3&crop=faces&fit=crop&w=64&h=64",
        large:
          "https://images.unsplash.com/profile-1574623311321-015452cd1304image?ixlib=rb-4.0.3&crop=faces&fit=crop&w=128&h=128",
      },
      instagram_username: "xninjason",
      total_collections: 3,
      total_likes: 0,
      total_photos: 8657,
      total_promoted_photos: 782,
      accepted_tos: true,
      for_hire: true,
      social: {
        instagram_username: "xninjason",
        portfolio_url: "https://jasonleung.co",
        twitter_username: null,
        paypal_email: null,
      },
    },
    exif: {
      make: "Canon",
      model: "Canon EOS R",
      name: "Canon, EOS R",
      exposure_time: "1/5000",
      aperture: "1.4",
      focal_length: "85.0",
      iso: 100,
    },
    location: {
      name: null,
      city: null,
      country: null,
      position: {
        latitude: null,
        longitude: null,
      },
    },
    views: 17920054,
    downloads: 20220,
  },
];

export const DEFAULT_COLORS = [
  { color: "bg-red-500", value: "Red" },
  { color: "bg-yellow-500", value: "Yellow" },
  { color: "bg-green-500", value: "Green" },
  { color: "bg-blue-500", value: "Blue" },
  { color: "bg-indigo-500", value: "Indigo" },
  { color: "bg-purple-500", value: "Purple" },
  { color: "bg-pink-500", value: "Pink" },
  { color: "bg-zinc-500", value: "zinc" },
  { color: "bg-black", value: "Black" },
];
