// In: routes/viewRoutes.js

const express = require('express');
const router = express.Router();
const SiteImage = require('../models/siteImage');
const TextContent = require('../models/textContent');
const HistoricalEvent = require('../models/historicalEvent');

// ** THE FIX IS HERE: The full object definitions are restored. **

// Default images as fallbacks
const defaultImages = {
    heroBackground: 'https://img.freepik.com/free-photo/view-luxurious-royal-library-with-books-classic-style_23-2151040306.jpg?w=1920',
    homeGallery1: 'https://img.freepik.com/free-photo/colosseum-rome-italy-daylight_23-2150821217.jpg?w=1380',
    homeGallery2: 'https://img.freepik.com/free-photo/fushimi-inari-shrine-kyoto-japan_23-2151239853.jpg?w=1380',
    homeGallery3: 'https://img.freepik.com/free-photo/giza-pyramids-egypt_23-2151121852.jpg?w=1380',
    memorialLincoln: 'https://img.freepik.com/free-photo/lincoln-memorial-washington-dc_23-2150821042.jpg?w=1380',
    homeMap: 'https://images.unsplash.com/photo-1542332213-9b5a5a3be3e6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    testimonialAvatar1: 'https://img.freepik.com/free-photo/portrait-smiling-blond-woman_23-2148159672.jpg?w=900',
    testimonialAvatar2: 'https://img.freepik.com/free-photo/portrait-successful-man-having-stubble-posing-with-broad-smile-keeping-arms-folded_171337-1880.jpg?w=1380',
    testimonialAvatar3: 'https://img.freepik.com/free-photo/pretty-smiling-joyfully-female-with-fair-hair-dressed-casually-looking-with-satisfaction_176420-15187.jpg?w=1380',
};

// Default texts as fallbacks
const defaultTexts = {
    homeHeroTitle: "Discover History's Treasures. Explore Our Shared Heritage.",
    homeHeroSubtitle: "An open platform to find, share, and preserve the world's most important historical and cultural landmarks.",
    homeHeroButton: "Explore the Map",
    homeGalleryTitle: "Journey Through Time",
    homeMemorialTitle: "Memorial of the Day",
    homeMemorialName: "The Lincoln Memorial",
    homeMemorialDesc: "An American national memorial built to honor the 16th President of the United States, Abraham Lincoln. It stands as a symbol of unity, strength, and wisdom.",
    homeMapTitle: "Explore the Interactive Map",
    homeTestimonialTitle: "Trusted by a Global Community",
    aboutMissionTitle: "Our Mission",
    aboutMissionParagraph: "Heritage Hub was founded on a simple principle: our shared history is a treasure that deserves to be discovered, preserved, and celebrated. We are an open, community-driven platform dedicated to documenting and sharing the world's most important historical and cultural landmarks. By bringing together stories, photographs, and geographical data, we aim to create a living atlas of human history for educators, students, travelers, and enthusiasts alike.",
    aboutTestimonialTitle: "Trusted by a Global Community of Historians & Explorers.",
    aboutTestimonialQuote1: '"This is an incredible resource. The ability to see user photos from historical sites brings them to life in a way textbooks never could."',
    aboutTestimonialAuthor1: "Eleanor Vance",
    aboutTestimonialQuote2: '"As a history teacher, Heritage Hub is invaluable. I use the interactive map in my classroom to take students on virtual field trips around the world."',
    aboutTestimonialAuthor2: "David Chen",
    aboutTestimonialQuote3: '"I love contributing my travel photos and being part of a community dedicated to preserving these amazing places for future generations."',
    aboutTestimonialAuthor3: "Maria Garcia",
};

router.get('/', async (req, res) => {
  try {
    // Fetch all dynamic data from the database
    const imagesFromDB = await SiteImage.find({});
    const textsFromDB = await TextContent.find({});
    const allEvents = await HistoricalEvent.find({}).sort({ month: 1, day: 1 });
    
    // Memorial of the Day Logic
    let memorialOfTheDay = await HistoricalEvent.findOne({ isFeatured: true });
    if (!memorialOfTheDay) {
        const today = new Date();
        const currentMonth = today.getMonth() + 1;
        const currentDay = today.getDate();
        memorialOfTheDay = await HistoricalEvent.findOne({ month: currentMonth, day: currentDay });
    }

    // Collate and merge data with defaults
    const siteImages = imagesFromDB.reduce((acc, img) => { (acc[img.key] = img.imageUrl); return acc; }, {});
    const allImages = { ...defaultImages, ...siteImages };
    
    const siteTexts = textsFromDB.reduce((acc, txt) => { (acc[txt.key] = txt.content); return acc; }, {});
    const allTexts = { ...defaultTexts, ...siteTexts };

    // Determine which layout to use
    const isPreview = req.query.preview === 'true';
    const layoutFile = isPreview ? 'partials/_previewLayout' : 'partials/_layout';

    // Render the chosen layout, passing all required data
    res.render(layoutFile, {
        siteImages: allImages,
        siteTexts: allTexts,
        memorialOfTheDay: memorialOfTheDay,
        allEvents: allEvents
    });

  } catch (error) {
    console.error("Error fetching site data:", error);
    res.status(500).send("Error loading page data.");
  }
});

module.exports = router;