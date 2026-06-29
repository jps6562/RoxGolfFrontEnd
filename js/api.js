// Same-origin — works locally (localhost:5xxx) and on Azure
const API_BASE = '';

async function postScore() {
    const player = document.getElementById('scorePlayer').value.trim();
    const gross  = parseFloat(document.getElementById('scoreGross').value);
    const rating = parseFloat(document.getElementById('scoreCourse').value);
    const slope  = parseInt(document.getElementById('scoreSlope').value);
    const par    = parseInt(document.getElementById('scorePar').value) || 72;

    if (!player || isNaN(gross) || isNaN(rating) || isNaN(slope)) {
        alert('Please fill in Player, Gross Score, Course Rating, and Slope Rating.');
        return;
    }

    // WHS differential — show instantly without waiting for network
    const diff = ((gross - rating) * (113 / slope)).toFixed(1);
    document.getElementById('hcpValue').textContent = diff;
    document.getElementById('hcpResult').classList.add('show');

    try {
        const res = await fetch(`${API_BASE}/api/golf/scores`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                playerName:   player,
                grossScore:   gross,
                courseRating: rating,
                slopeRating:  slope,
                coursePar:    par,
                season:       new Date().getFullYear().toString(),
                leagueType:   'League'
            })
        });
        if (res.ok) {
            const data = await res.json();
            console.log('Score posted:', data);
            // Reload standings after posting
            loadStandings(new Date().getFullYear());
        }
    } catch (e) {
        console.warn('Backend offline — differential shown from local calculation.', e);
    }
}

async function loadStandings(season) {
    try {
        const res = await fetch(`${API_BASE}/api/golf/standings/${season}`);
        if (!res.ok) return;
        const data = await res.json();
        renderGolfStandings(data);
    } catch (e) {
        console.warn('Could not load standings:', e);
    }
}

function renderGolfStandings(data) {
    const tbody = document.getElementById('leagueStandingsBody');
    if (!tbody) return;
    if (!data || !data.length) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-3);padding:16px">No scores posted yet</td></tr>';
        return;
    }
    tbody.innerHTML = data.map((p, i) => `
        <tr>
            <td class="pos">${i + 1}</td>
            <td class="name">${p.player}</td>
            <td>${p.rounds}</td>
            <td>${p.avgNet}</td>
            <td><span class="hcp">${p.handicapIndex}</span></td>
        </tr>
    `).join('');
}

async function loadBowlingStandings(season) {
    try {
        const res = await fetch(`${API_BASE}/api/bowling/standings/${season}`);
        if (!res.ok) return;
        const data = await res.json();
        const tbody = document.getElementById('bowlingStandingsBody'); // in screen-bl-current
        if (!tbody) return;
        if (!data || !data.length) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--text-3);padding:16px">No scores posted yet</td></tr>';
            return;
        }
        tbody.innerHTML = data.map((t, i) => `
            <tr>
                <td class="pos">${i + 1}</td>
                <td class="name">${t.team}</td>
                <td>${t.games}</td>
                <td>${t.avgScore.toFixed(1)}</td>
            </tr>
        `).join('');
    } catch (e) {
        console.warn('Could not load bowling standings:', e);
    }
}
