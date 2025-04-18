import express from 'express';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio'; // Corrected import

const app = express();
const PORT = process.env.PORT || 8080;

// --- CONFIGURATION ---
// Updated CricClubs match URL based on terminal output
const CRICCLUBS_MATCH_URL = 'https://cricclubs.com/FT20/viewScorecard.do?matchId=675&clubId=862';
// ---------------------

// Serve static files from 'client' directory
app.use(express.static('client'));

// API endpoint to fetch score
app.get('/api/score', async (req, res) => {
  try {
    console.log(`Fetching score from: ${CRICCLUBS_MATCH_URL}`);
    const response = await fetch(CRICCLUBS_MATCH_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const html = await response.text();
    const $ = cheerio.load(html);

    // --- SCRAPING LOGIC ---
    // Selectors based on the provided HTML snippet

    // Find the main container list
    const scoreList = $('div.schedule-logo ul');

    // Find the list items for each team (first and second li with class 'win')
    const team1ListItem = scoreList.find('li.win').eq(0);
    const team2ListItem = scoreList.find('li.win').eq(1);

    // Extract data for Team 1
    const team1Name = team1ListItem.find('.teamName').text().trim() || 'Team 1';
    // Find the second span within the list item for the score
    const team1Score = team1ListItem.find('span').eq(1).text().trim() || 'N/A';
    const team1Overs = team1ListItem.find('p').text().replace(/\s+/g, ' ').trim() || 'N/A'; // Clean up whitespace in overs

    // Extract data for Team 2
    const team2Name = team2ListItem.find('.teamName').text().trim() || 'Team 2';
    // Find the second span within the list item for the score
    const team2Score = team2ListItem.find('span').eq(1).text().trim() || 'N/A';
    const team2Overs = team2ListItem.find('p').text().replace(/\s+/g, ' ').trim() || 'N/A'; // Clean up whitespace in overs

    // Attempt to find match status (Selector is still a guess, might need adjustment)
    // Look for common status elements, adjust if you find the correct one by inspecting
    const matchStatusElement = $('.match_status_details').first() || $('.innings_info').first(); // Example common selectors
    const matchStatus = matchStatusElement.text().trim() || '';

    // Construct a structured data object
    const scoreData = {
      team1: {
        name: team1Name,
        score: team1Score,
        overs: team1Overs,
      },
      team2: {
        name: team2Name,
        score: team2Score,
        overs: team2Overs,
      },
      status: matchStatus,
    };

    // Check if we actually found meaningful score data
    // (Check if at least one score was found, adjust condition if needed)
    if (team1Score === 'N/A' && team2Score === 'N/A') {
        console.warn("Could not find score elements with updated selectors. Please double-check CricClubs page structure and selectors in server/index.js.");
         res.json({
             error: 'Scraping failed. Check server selectors.',
             htmlContent: '<div>Score unavailable. Selectors might need updating in server/index.js.</div>',
             lastUpdated: new Date().toISOString(),
         });
    } else {
        console.log("Successfully scraped score data:", scoreData); // Log success
        // Send the structured data
        res.json({
          scoreData: scoreData,
          lastUpdated: new Date().toISOString(),
        });
    }
    // ----------------------

  } catch (error) {
    console.error('Error fetching or parsing scorecard:', error);
    res.status(500).json({ error: 'Failed to fetch score', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT}`);
});
