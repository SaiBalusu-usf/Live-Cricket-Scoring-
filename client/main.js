const scoreEl = document.getElementById('score');
const updatedEl = document.getElementById('updated');

async function fetchScore() {
  try {
    const response = await fetch('/api/score');
    if (!response.ok) {
      // Try to get error details from the server response body if possible
      let errorDetails = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorDetails = errorData.error || errorData.details || errorDetails;
      } catch (e) { /* Ignore if response body isn't valid JSON */ }
      throw new Error(errorDetails);
    }
    const data = await response.json();

    // --- UPDATE DISPLAY ---
    // Check if the server reported a scraping error
    if (data.error) {
      console.warn('Server reported an error:', data.error);
      // Use the fallback HTML content if provided, otherwise show the error
      scoreEl.innerHTML = data.htmlContent || `<div>Error: ${data.error}</div>`;
    }
    // Check if we received the structured score data
    else if (data.scoreData) {
      const score = data.scoreData;
      // Construct HTML from the structured data
      scoreEl.innerHTML = `
        <div class="team-score">
          <span class="team-name">${score.team1.name || 'Team 1'}</span>
          <span class="score">${score.team1.score || 'N/A'}</span>
          <span class="overs">${score.team1.overs || ''}</span>
        </div>
        <div class="vs">vs</div>
        <div class="team-score">
          <span class="team-name">${score.team2.name || 'Team 2'}</span>
          <span class="score">${score.team2.score || 'N/A'}</span>
          <span class="overs">${score.team2.overs || ''}</span>
        </div>
        ${score.status ? `<div class="match-status">${score.status}</div>` : ''}
      `;
    }
    // Fallback if the response format is unexpected
    else {
      console.warn('Unexpected data format received:', data);
      scoreEl.innerHTML = '<div>Score data unavailable.</div>';
    }

    // Update the timestamp
    if (data.lastUpdated) {
      updatedEl.textContent = `Last updated: ${new Date(
        data.lastUpdated
      ).toLocaleTimeString()}`;
    } else {
      updatedEl.textContent = '';
    }
    // --------------------

  } catch (error) {
    console.error('Error fetching score:', error);
    scoreEl.innerHTML = `<div>Error loading score: ${error.message}</div>`;
    updatedEl.textContent = '';
  }
}

// Fetch score immediately and then every 30 seconds
fetchScore();
setInterval(fetchScore, 30000); // 30 seconds
