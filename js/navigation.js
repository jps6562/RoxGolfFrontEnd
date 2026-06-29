const stack = [];

function nav(id, title, crumbs) {
    const from = document.querySelector('.screen.active');
    if (from) from.classList.remove('active');

    const to = document.getElementById('screen-' + id);
    if (!to) return;
    to.classList.add('active');

    stack.push({ id, title, crumbs: crumbs || [] });
    syncUI(title, crumbs || []);
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Trigger data loads for specific screens
    if (id === 'gl-stats')   loadStandings(new Date().getFullYear());
    if (id === 'bl-current') loadBowlingStandings(new Date().getFullYear());
}

function goBack() {
    if (!stack.length) return;
    stack.pop();

    const cur = document.querySelector('.screen.active');
    if (cur) cur.classList.remove('active');

    if (!stack.length) {
        document.getElementById('screen-home').classList.add('active');
        syncUI('Home', []);
    } else {
        const prev = stack[stack.length - 1];
        document.getElementById('screen-' + prev.id).classList.add('active');
        syncUI(prev.title, prev.crumbs);
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
}

function syncUI(title, crumbs) {
    document.getElementById('pageTitle').textContent = title;
    document.getElementById('backBtn').classList.toggle('show', stack.length > 0);

    const bc = document.getElementById('breadcrumb');
    if (crumbs && crumbs.length > 1) {
        bc.classList.add('show');
        const parts = crumbs.map((c, i) => {
            const sep = i < crumbs.length - 1 ? '<span class="crumb-sep">›</span>' : '';
            return `<span class="crumb">${c}</span>${sep}`;
        }).join('');
        bc.innerHTML = parts + '<span class="crumb-sep">›</span><span class="crumb cur">' + title + '</span>';
    } else {
        bc.classList.remove('show');
    }
}
