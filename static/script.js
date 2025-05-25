document.getElementById('jsonFile').addEventListener('change', function() {
    const file = this.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    fetch('/upload', {
        method: 'POST',
        body: formData
    }).then(res => res.json())
      .then(data => {
        if (data.error) {
            alert(data.error);
            return;
        }
        renderSummary(data.players);
        renderTimeline(data.moments);
    });
});

function renderSummary(players) {
    const container = document.getElementById('summary');
    const majorPlayers = players.filter(p => !p.LeaderType.includes("MINOR_CIV") && p.LeaderType !== "LEADER_FREE_CITIES" && p.LeaderType !== "LEADER_DEFAULT");

    container.innerHTML = `<h2>Players</h2><table><tr><th>Civilization</th><th>Leader</th><th>View Timeline</th></tr>` +
        majorPlayers.map(p => `
            <tr>
                <td>${p.CivilizationDescription}</td>
                <td>${p.LeaderName}</td>
                <td><a href="#" onclick="filterTimeline(${p.Id})">View ${p.CivilizationDescription}'s Timeline </a></td>
            </tr>
        `).join('') +
        `</table>`;
        // Add city-state names at the bottom
    const cityStates = players
        .filter(p => p.LeaderType.includes("MINOR_CIV"))
        .map(p => p.CivilizationShortDescription);

    container.innerHTML += `<div class="citystates"><strong>City-States in Game:</strong> ${cityStates.join(', ')}</div>`;
}

let allMoments = [];

function renderTimeline(moments) {
    allMoments = moments; // Save all for future filters
    displayTimeline(moments);
}

function displayTimeline(moments) {
    const container = document.getElementById('timeline');
    container.innerHTML = `<h2>Timeline</h2>` + 
        moments.map(m => 
            `<div class="moment">
                <strong>Turn ${m.Turn}</strong>: ${m.Type.replace("MOMENT_", "").replaceAll("_", " ")}<br>
                <em>${m.PlayerName} (${m.CivName})</em><br>
                ${m.InstanceDescription.replace('[ICON_RESOURCE_ANTIQUITY_SITE]', '<img src="/static/res/Antiquity_Site.webp" alt="Antiquity Site" class="icon">')}<br>
                Era Score: ${m.EraScore}
            </div>`
        ).join('');
}

function filterTimeline(playerId) {
    const filtered = allMoments.filter(m => m.ActingPlayer === playerId);
    displayTimeline(filtered);
}

